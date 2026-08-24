import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, posts, pods, profiles } from "@/db/schema";
import { getFounderIds } from "@/lib/pods";
import { sendMail, mailConfigured } from "@/lib/mailer";
import { notificationEmail } from "@/lib/community-emails";
import { sendPushToMember } from "@/lib/push";

/** What we stash in the notification's jsonb payload so rendering needs no joins. */
export type NotifPayload = {
  actorId?: string;
  actorName?: string;
  actorAvatar?: string | null;
  title: string; // e.g. "replied to your post"
  preview?: string; // short snippet of the content
  href: string; // where clicking it goes
  entityId?: string; // for de-duping bursts (e.g. the post id)
};

export type NotifKind = "reply" | "reaction" | "dm" | "badge" | "report" | "mention" | "event";

export type NotifItem = {
  id: string;
  kind: NotifKind;
  read: boolean;
  createdAt: Date;
} & NotifPayload;

const ICON: Record<NotifKind, string> = {
  reply: "💬", reaction: "❤️", dm: "✉️", badge: "🏅", report: "🚩", mention: "@", event: "📅",
};

export function notifIcon(kind: string): string {
  return ICON[kind as NotifKind] ?? "🔔";
}

/** Look up an actor's display name + avatar for denormalising into the payload. */
async function actorInfo(actorId: string): Promise<{ name: string; avatar: string | null }> {
  const r = await db.select({ name: profiles.displayName, email: profiles.email, avatar: profiles.avatarUrl })
    .from(profiles).where(eq(profiles.clerkUserId, actorId)).limit(1);
  const p = r[0];
  return { name: p?.name ?? p?.email?.split("@")[0] ?? "A member", avatar: p?.avatar ?? null };
}

/** Resolve where a post lives so a notification can deep-link to it. */
async function postHref(postId: string, podId: string | null): Promise<string> {
  if (!podId) return `/hub/community#post-${postId}`;
  const r = await db.select({ slug: pods.slug }).from(pods).where(eq(pods.id, podId)).limit(1);
  return r[0] ? `/hub/pods/${r[0].slug}#post-${postId}` : `/hub/community#post-${postId}`;
}

/** High-signal kinds that also send an instant email (reactions never do). */
const INSTANT_EMAIL: Partial<Record<NotifKind, string>> = {
  reply: "View the reply", dm: "Open the message", report: "Review the post", mention: "View the post",
};

/** Kinds worth a lock-screen push (reactions stay in-app only to avoid noise). */
const PUSH_KINDS = new Set<NotifKind>(["reply", "dm", "report", "mention", "badge"]);

/** Core insert. No-ops on self-notification. `dedupe` collapses repeat unread bursts. */
export async function notify(
  memberId: string,
  kind: NotifKind,
  payload: NotifPayload,
  opts: { dedupe?: boolean } = {},
): Promise<void> {
  if (!memberId || memberId === payload.actorId) return;
  if (opts.dedupe && payload.entityId && payload.actorId) {
    // Remove a prior unread notice of the same kind/actor/entity so it doesn't stack.
    await db.delete(notifications).where(and(
      eq(notifications.memberId, memberId),
      eq(notifications.type, kind),
      isNull(notifications.readAt),
      sql`${notifications.payload}->>'entityId' = ${payload.entityId}`,
      sql`${notifications.payload}->>'actorId' = ${payload.actorId}`,
    ));
  }
  await db.insert(notifications).values({ memberId, type: kind, payload });
  await Promise.all([maybeEmail(memberId, kind, payload), maybePush(memberId, kind, payload)]);
}

/** Send a lock-screen push for high-signal kinds (member opts in per device). */
async function maybePush(memberId: string, kind: NotifKind, payload: NotifPayload): Promise<void> {
  if (!PUSH_KINDS.has(kind)) return;
  const title = payload.actorName ? `${payload.actorName} ${payload.title}` : payload.title;
  await sendPushToMember(memberId, {
    title, body: payload.preview, url: payload.href, tag: `${kind}:${payload.entityId ?? ""}`,
  });
}

/** Send an instant email for high-signal kinds, if the member opted in. */
async function maybeEmail(memberId: string, kind: NotifKind, payload: NotifPayload): Promise<void> {
  const cta = INSTANT_EMAIL[kind];
  if (!cta || !mailConfigured()) return;
  const r = await db.select({ email: profiles.email, on: profiles.emailInstant })
    .from(profiles).where(eq(profiles.clerkUserId, memberId)).limit(1);
  if (!r[0] || r[0].on === false || !r[0].email) return;
  const { subject, html, text } = notificationEmail({
    actorName: payload.actorName, title: payload.title, preview: payload.preview, href: payload.href, cta,
  });
  await sendMail({ to: r[0].email, subject, html, text });
}

/* ── Typed emitters, called from server actions ────────────────────────── */

/** Someone replied to / commented on a post → tell the author. */
export async function notifyReply(postId: string, actorId: string, preview: string): Promise<void> {
  const row = await db.select({ authorId: posts.authorId, podId: posts.podId, title: posts.title })
    .from(posts).where(eq(posts.id, postId)).limit(1);
  if (!row[0] || row[0].authorId === actorId) return;
  const [actor, href] = await Promise.all([actorInfo(actorId), postHref(postId, row[0].podId)]);
  await notify(row[0].authorId, "reply", {
    actorId, actorName: actor.name, actorAvatar: actor.avatar,
    title: "replied to your post", preview: preview.slice(0, 140), href, entityId: postId,
  });
}

/** Someone reacted to a post → tell the author (deduped per actor+post). */
export async function notifyReaction(postId: string, actorId: string, emoji: string): Promise<void> {
  const row = await db.select({ authorId: posts.authorId, podId: posts.podId })
    .from(posts).where(eq(posts.id, postId)).limit(1);
  if (!row[0] || row[0].authorId === actorId) return;
  const [actor, href] = await Promise.all([actorInfo(actorId), postHref(postId, row[0].podId)]);
  await notify(row[0].authorId, "reaction", {
    actorId, actorName: actor.name, actorAvatar: actor.avatar,
    title: `reacted ${emoji} to your post`, href, entityId: postId,
  }, { dedupe: true });
}

/** A direct message → tell the recipient. */
export async function notifyDM(threadId: string, actorId: string, recipientId: string, preview: string): Promise<void> {
  const actor = await actorInfo(actorId);
  await notify(recipientId, "dm", {
    actorId, actorName: actor.name, actorAvatar: actor.avatar,
    title: "sent you a message", preview: preview.slice(0, 140),
    href: `/hub/messages/${threadId}`, entityId: threadId,
  }, { dedupe: true });
}

/** A member earned a credential → congratulate them (no actor). */
export async function notifyBadge(memberId: string, badgeName: string, badgeIcon: string): Promise<void> {
  await notify(memberId, "badge", {
    title: `You earned a new credential: ${badgeIcon} ${badgeName}`,
    href: "/hub#achievements", entityId: badgeName,
  });
}

/** A post was reported → alert every founder. */
export async function notifyReport(postId: string, reporterId: string, reason: string | null): Promise<void> {
  const [row, founders] = await Promise.all([
    db.select({ podId: posts.podId }).from(posts).where(eq(posts.id, postId)).limit(1),
    getFounderIds(),
  ]);
  if (!row[0]) return;
  const [actor, href] = await Promise.all([actorInfo(reporterId), postHref(postId, row[0].podId)]);
  await Promise.all(founders.map((f) => notify(f, "report", {
    actorId: reporterId, actorName: actor.name, actorAvatar: actor.avatar,
    title: "reported a post", preview: reason ? reason.slice(0, 140) : undefined, href, entityId: postId,
  })));
}

/* ── Reads ─────────────────────────────────────────────────────────────── */

export async function getNotifications(memberId: string, limit = 40): Promise<NotifItem[]> {
  const rows = await db.select().from(notifications)
    .where(eq(notifications.memberId, memberId))
    .orderBy(desc(notifications.createdAt)).limit(limit);
  return rows.map((r) => {
    const p = (r.payload ?? {}) as NotifPayload;
    return { id: r.id, kind: r.type as NotifKind, read: r.readAt != null, createdAt: r.createdAt, ...p };
  });
}

export async function getUnreadNotifCount(memberId: string): Promise<number> {
  const r = await db.select({ n: sql<number>`count(*)::int` }).from(notifications)
    .where(and(eq(notifications.memberId, memberId), isNull(notifications.readAt)));
  return r[0]?.n ?? 0;
}

export async function markAllNotificationsRead(memberId: string): Promise<void> {
  await db.update(notifications).set({ readAt: new Date() })
    .where(and(eq(notifications.memberId, memberId), isNull(notifications.readAt)));
}

export async function markNotificationRead(id: string, memberId: string): Promise<void> {
  await db.update(notifications).set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.memberId, memberId)));
}
