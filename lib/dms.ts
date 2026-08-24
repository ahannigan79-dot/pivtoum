import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { dmMessages, dmThreadMembers, dmThreads, profiles } from "@/db/schema";
import { notifyDM } from "@/lib/notifications";

export type DMPerson = { id: string; name: string; avatarUrl: string | null; handle: string | null };
export type DMConversation = {
  threadId: string; other: DMPerson; lastBody: string | null; lastAt: Date | null; unread: number;
};
export type DMMessage = { id: string; senderId: string; body: string; createdAt: Date };

function person(p: typeof profiles.$inferSelect): DMPerson {
  return { id: p.clerkUserId, name: p.displayName ?? p.email.split("@")[0], avatarUrl: p.avatarUrl, handle: p.handle };
}

/** Find or create the 1:1 DM thread between two members. */
export async function getOrCreateDMThread(meId: string, otherId: string): Promise<string> {
  if (meId === otherId) throw new Error("Cannot DM yourself");
  const mine = await db.select({ t: dmThreadMembers.threadId }).from(dmThreadMembers).where(eq(dmThreadMembers.memberId, meId));
  const theirs = await db.select({ t: dmThreadMembers.threadId }).from(dmThreadMembers).where(eq(dmThreadMembers.memberId, otherId));
  const theirSet = new Set(theirs.map((r) => r.t));
  const shared = mine.map((r) => r.t).find((t) => theirSet.has(t));
  if (shared) return shared;

  const created = await db.insert(dmThreads).values({}).returning({ id: dmThreads.id });
  const threadId = created[0].id;
  await db.insert(dmThreadMembers).values([
    { threadId, memberId: meId, lastReadAt: new Date() },
    { threadId, memberId: otherId },
  ]).onConflictDoNothing();
  return threadId;
}

/** The member's DM inbox — one row per conversation, newest first. */
export async function getInbox(meId: string): Promise<DMConversation[]> {
  const memberships = await db.select({ threadId: dmThreadMembers.threadId, lastReadAt: dmThreadMembers.lastReadAt })
    .from(dmThreadMembers).where(eq(dmThreadMembers.memberId, meId));
  const threadIds = memberships.map((m) => m.threadId);
  if (!threadIds.length) return [];
  const lastRead = new Map(memberships.map((m) => [m.threadId, m.lastReadAt]));

  const [others, msgs] = await Promise.all([
    db.select({ threadId: dmThreadMembers.threadId, p: profiles })
      .from(dmThreadMembers).innerJoin(profiles, eq(dmThreadMembers.memberId, profiles.clerkUserId))
      .where(and(inArray(dmThreadMembers.threadId, threadIds), ne(dmThreadMembers.memberId, meId))),
    db.select().from(dmMessages).where(inArray(dmMessages.threadId, threadIds)).orderBy(asc(dmMessages.createdAt)),
  ]);
  const otherByThread = new Map(others.map((r) => [r.threadId, person(r.p)]));

  const last = new Map<string, typeof dmMessages.$inferSelect>();
  const unread = new Map<string, number>();
  for (const m of msgs) {
    last.set(m.threadId, m);
    const lr = lastRead.get(m.threadId);
    if (m.senderId !== meId && (!lr || m.createdAt > lr)) unread.set(m.threadId, (unread.get(m.threadId) ?? 0) + 1);
  }

  return threadIds
    .map((t) => ({
      threadId: t, other: otherByThread.get(t) ?? { id: "", name: "Member", avatarUrl: null, handle: null },
      lastBody: last.get(t)?.body ?? null, lastAt: last.get(t)?.createdAt ?? null, unread: unread.get(t) ?? 0,
    }))
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
}

/** Total unread DMs, for a nav badge. */
export async function getUnreadCount(meId: string): Promise<number> {
  const inbox = await getInbox(meId);
  return inbox.reduce((n, c) => n + c.unread, 0);
}

/** A single conversation (must be a member). Marks it read. */
export async function getConversation(threadId: string, meId: string): Promise<{ other: DMPerson; messages: DMMessage[] } | null> {
  const mem = await db.select({ id: dmThreadMembers.memberId }).from(dmThreadMembers)
    .where(and(eq(dmThreadMembers.threadId, threadId), eq(dmThreadMembers.memberId, meId))).limit(1);
  if (!mem.length) return null;

  const [otherRows, msgs] = await Promise.all([
    db.select({ p: profiles }).from(dmThreadMembers).innerJoin(profiles, eq(dmThreadMembers.memberId, profiles.clerkUserId))
      .where(and(eq(dmThreadMembers.threadId, threadId), ne(dmThreadMembers.memberId, meId))).limit(1),
    db.select().from(dmMessages).where(eq(dmMessages.threadId, threadId)).orderBy(asc(dmMessages.createdAt)).limit(200),
  ]);
  await db.update(dmThreadMembers).set({ lastReadAt: new Date() })
    .where(and(eq(dmThreadMembers.threadId, threadId), eq(dmThreadMembers.memberId, meId)));

  return {
    other: otherRows[0] ? person(otherRows[0].p) : { id: "", name: "Member", avatarUrl: null, handle: null },
    messages: msgs.map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, createdAt: m.createdAt })),
  };
}

/** Send a DM (must be a member of the thread). */
export async function sendDM(threadId: string, meId: string, body: string): Promise<void> {
  const b = body.trim();
  if (!b) return;
  const members = await db.select({ id: dmThreadMembers.memberId }).from(dmThreadMembers)
    .where(eq(dmThreadMembers.threadId, threadId));
  if (!members.some((m) => m.id === meId)) return;
  await db.insert(dmMessages).values({ threadId, senderId: meId, body: b.slice(0, 4000) });
  const recipient = members.find((m) => m.id !== meId);
  if (recipient) await notifyDM(threadId, meId, recipient.id, b);
}
