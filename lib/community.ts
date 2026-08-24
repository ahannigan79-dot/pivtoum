import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { comments, postReports, posts, profiles, reactions } from "@/db/schema";

export type FeedAuthor = { id: string; name: string; avatarUrl: string | null; handle: string | null; role: string };
export type FeedComment = { id: string; body: string; createdAt: Date; author: FeedAuthor };
export type FeedPost = {
  id: string; title: string | null; topic: string | null; body: string; createdAt: Date;
  pinned: boolean; author: FeedAuthor;
  reactionCount: number; iReacted: boolean; comments: FeedComment[]; reportCount: number;
};

function author(a: typeof profiles.$inferSelect): FeedAuthor {
  return { id: a.clerkUserId, name: a.displayName ?? a.email.split("@")[0], avatarUrl: a.avatarUrl, handle: a.handle, role: a.role };
}

/** The whole-community feed (podId null), pinned first then newest, optionally filtered by topic. */
export function getCommunityFeed(meId: string | null, topic?: string | null): Promise<FeedPost[]> {
  const base = isNull(posts.podId);
  const where = topic ? and(base, eq(posts.topic, topic)) : base;
  return buildFeed(where, meId);
}

/** A single pod's feed (posts scoped to that pod). */
export function getPodFeed(podId: string, meId: string | null): Promise<FeedPost[]> {
  return buildFeed(eq(posts.podId, podId), meId);
}

/** A single thread's feed (posts scoped to that thread). */
export function getThreadFeed(threadId: string, meId: string | null): Promise<FeedPost[]> {
  return buildFeed(eq(posts.threadId, threadId), meId);
}

/** Shared feed builder: given a WHERE over posts, hydrate authors, comments, reactions. */
async function buildFeed(where: SQL | undefined, meId: string | null): Promise<FeedPost[]> {
  const rows = await db
    .select({ p: posts, a: profiles })
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.clerkUserId))
    .where(where)
    .orderBy(desc(posts.pinned), desc(posts.createdAt))
    .limit(50);
  if (!rows.length) return [];

  const ids = rows.map((r) => r.p.id);
  const cRows = await db
    .select({ c: comments, a: profiles })
    .from(comments)
    .innerJoin(profiles, eq(comments.authorId, profiles.clerkUserId))
    .where(inArray(comments.postId, ids))
    .orderBy(asc(comments.createdAt));
  const rRows = await db.select().from(reactions).where(inArray(reactions.postId, ids));
  const repRows = await db.select({ postId: postReports.postId, n: sql<number>`count(*)::int` })
    .from(postReports).where(inArray(postReports.postId, ids)).groupBy(postReports.postId);
  const reportCount = new Map(repRows.map((r) => [r.postId, r.n]));

  const commentsByPost = new Map<string, FeedComment[]>();
  for (const { c, a } of cRows) {
    const list = commentsByPost.get(c.postId) ?? [];
    list.push({ id: c.id, body: c.body, createdAt: c.createdAt, author: author(a) });
    commentsByPost.set(c.postId, list);
  }
  const reactCount = new Map<string, number>();
  const mine = new Set<string>();
  for (const r of rRows) {
    reactCount.set(r.postId, (reactCount.get(r.postId) ?? 0) + 1);
    if (meId && r.memberId === meId) mine.add(r.postId);
  }

  return rows.map(({ p, a }) => ({
    id: p.id, title: p.title, topic: p.topic, body: p.body, createdAt: p.createdAt,
    pinned: p.pinned, author: author(a),
    reactionCount: reactCount.get(p.id) ?? 0, iReacted: mine.has(p.id),
    comments: commentsByPost.get(p.id) ?? [], reportCount: reportCount.get(p.id) ?? 0,
  }));
}

export function timeAgo(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  const s = Math.max(1, Math.floor((Date.now() - t.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24); if (days < 7) return `${days}d`;
  return t.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
