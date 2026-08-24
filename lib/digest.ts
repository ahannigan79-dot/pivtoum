import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles, notifications, mapStates, events } from "@/db/schema";
import { PERSONAL_RESCORE_DAYS } from "@/lib/trajectory";
import { formatWhen } from "@/lib/events";
import { digestEmail } from "@/lib/community-emails";
import { sendMail, mailConfigured } from "@/lib/mailer";
import type { NotifPayload } from "@/lib/notifications";

const DAY = 24 * 60 * 60 * 1000;
const DORMANT_DAYS = 10;
const RESEND_GAP_DAYS = 6; // don't re-send a digest within this window

export type DigestResult = { candidates: number; sent: number; skipped: number };

/** Build and send the weekly digest / re-engagement email to eligible members. */
export async function runWeeklyDigest(now = new Date(), limit = 500): Promise<DigestResult> {
  if (!mailConfigured()) return { candidates: 0, sent: 0, skipped: 0 };

  const cutoff = new Date(now.getTime() - RESEND_GAP_DAYS * DAY);
  const members = await db.select({
    id: profiles.clerkUserId, email: profiles.email, name: profiles.displayName, lastSeenAt: profiles.lastSeenAt,
  }).from(profiles).where(and(
    eq(profiles.emailDigest, true),
    sql`${profiles.email} is not null`,
    or(isNull(profiles.digestSentAt), lte(profiles.digestSentAt, cutoff)),
  )).limit(limit);

  if (!members.length) return { candidates: 0, sent: 0, skipped: 0 };
  const ids = members.map((m) => m.id);

  // Shared: community events in the next 7 days.
  const upcoming = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt })
    .from(events).where(and(gte(events.startsAt, now), lte(events.startsAt, new Date(now.getTime() + 7 * DAY))))
    .orderBy(events.startsAt).limit(4);
  const eventItems = upcoming.map((e) => ({ title: e.title, when: formatWhen(e.startsAt), href: "/hub/events" }));

  // Per-member: unread notifications + last map date, fetched in bulk.
  const [unreadRows, mapRows] = await Promise.all([
    db.select({ memberId: notifications.memberId, payload: notifications.payload, createdAt: notifications.createdAt })
      .from(notifications).where(and(inArray(notifications.memberId, ids), isNull(notifications.readAt)))
      .orderBy(desc(notifications.createdAt)),
    db.select({ memberId: mapStates.memberId, last: sql<string>`max(${mapStates.createdAt})` })
      .from(mapStates).where(inArray(mapStates.memberId, ids)).groupBy(mapStates.memberId),
  ]);

  const unreadByMember = new Map<string, { line: string; href: string }[]>();
  for (const r of unreadRows) {
    const p = (r.payload ?? {}) as NotifPayload;
    if (!p.href) continue;
    const line = `${p.actorName ? p.actorName + " " : ""}${p.title}`;
    const arr = unreadByMember.get(r.memberId) ?? unreadByMember.set(r.memberId, []).get(r.memberId)!;
    if (arr.length < 6) arr.push({ line, href: p.href });
  }
  const lastMap = new Map(mapRows.map((r) => [r.memberId, new Date(r.last)]));

  let sent = 0, skipped = 0;
  for (const m of members) {
    const updates = unreadByMember.get(m.id) ?? [];
    const mapAt = lastMap.get(m.id);
    const rescoreDue = mapAt ? (now.getTime() - mapAt.getTime()) / DAY >= PERSONAL_RESCORE_DAYS : false;
    const dormant = !m.lastSeenAt || (now.getTime() - m.lastSeenAt.getTime()) / DAY >= DORMANT_DAYS;

    // Nothing to say and they're active → don't email.
    if (!updates.length && !eventItems.length && !rescoreDue && !dormant) { skipped++; continue; }

    const { subject, html, text } = digestEmail({
      name: m.name ?? m.email.split("@")[0], updates, events: eventItems, rescoreDue, dormant,
    });
    const ok = await sendMail({ to: m.email, subject, html, text });
    if (ok) {
      sent++;
      await db.update(profiles).set({ digestSentAt: now }).where(eq(profiles.clerkUserId, m.id));
    } else {
      skipped++;
    }
  }

  return { candidates: members.length, sent, skipped };
}
