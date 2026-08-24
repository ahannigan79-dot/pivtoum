import { and, desc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  profiles, mapStates, commitments, posts, comments, reactions, podMembers, pods, memberBadges,
} from "@/db/schema";
import { getFounderIds } from "@/lib/pods";
import { PERSONAL_RESCORE_DAYS } from "@/lib/trajectory";

const DAY = 24 * 60 * 60 * 1000;
const ACTIVE_DAYS = 7;
const ATRISK_DAYS = 20;

export type HealthStatus = "active" | "at-risk" | "dormant";

export type MemberHealth = {
  id: string; name: string; email: string; avatarUrl: string | null; handle: string | null;
  careerStage: string | null; lane: string | null;
  status: HealthStatus; daysSinceSeen: number | null;
  mapped: boolean; editions: number; rescoreOverdue: boolean; daysSinceMap: number | null;
  movesActive: number; movesDone: number; posts30: number; comments30: number;
  pods: number; badges: number; streakDays: number;
  flags: string[]; attentionScore: number;
};

export type PodHealth = { id: string; name: string; slug: string; members: number; posts30: number; lastPostAt: Date | null; dead: boolean };
export type LandingPost = { id: string; href: string; author: string; podName: string; snippet: string; reactions: number; comments: number; createdAt: Date };

export type HealthReport = {
  summary: { total: number; active: number; atRisk: number; dormant: number; overdueRescore: number; neverMapped: number; noPod: number };
  attention: MemberHealth[];
  members: MemberHealth[];
  pods: PodHealth[];
  landing: LandingPost[];
};

const num = sql<number>`count(*)::int`;

export async function getHealthReport(now = new Date()): Promise<HealthReport> {
  const since30 = new Date(now.getTime() - 30 * DAY);
  const founderSet = new Set(await getFounderIds());

  const [profRows, mapRows, moveRows, post30Rows, comment30Rows, podMemRows, podCountRows, badgeRows, podRows, podPostRows] =
    await Promise.all([
      db.select().from(profiles),
      db.select({ memberId: mapStates.memberId, last: sql<string>`max(${mapStates.createdAt})`, editions: num })
        .from(mapStates).groupBy(mapStates.memberId),
      db.select({ memberId: commitments.memberId, status: commitments.status, n: num })
        .from(commitments).groupBy(commitments.memberId, commitments.status),
      db.select({ author: posts.authorId, n: num }).from(posts).where(gte(posts.createdAt, since30)).groupBy(posts.authorId),
      db.select({ author: comments.authorId, n: num }).from(comments).where(gte(comments.createdAt, since30)).groupBy(comments.authorId),
      db.select({ memberId: podMembers.memberId, n: num }).from(podMembers).groupBy(podMembers.memberId),
      db.select({ podId: podMembers.podId, n: num }).from(podMembers).groupBy(podMembers.podId),
      db.select({ memberId: memberBadges.memberId, n: num }).from(memberBadges).groupBy(memberBadges.memberId),
      db.select().from(pods),
      db.select({ podId: posts.podId, n: num, last: sql<string>`max(${posts.createdAt})` })
        .from(posts).where(and(gte(posts.createdAt, since30), isNotNull(posts.podId))).groupBy(posts.podId),
    ]);

  const lastMap = new Map(mapRows.map((r) => [r.memberId, { at: new Date(r.last), editions: r.editions }]));
  const movesActive = new Map<string, number>();
  const movesDone = new Map<string, number>();
  for (const r of moveRows) {
    if (r.status === "active") movesActive.set(r.memberId, r.n);
    else if (r.status === "done") movesDone.set(r.memberId, r.n);
  }
  const posts30 = new Map(post30Rows.map((r) => [r.author, r.n]));
  const comments30 = new Map(comment30Rows.map((r) => [r.author, r.n]));
  const myPods = new Map(podMemRows.map((r) => [r.memberId, r.n]));
  const badges = new Map(badgeRows.map((r) => [r.memberId, r.n]));

  const members: MemberHealth[] = [];
  for (const p of profRows) {
    if (founderSet.has(p.clerkUserId)) continue; // don't score the founders
    const daysSinceSeen = p.lastSeenAt ? Math.floor((now.getTime() - p.lastSeenAt.getTime()) / DAY) : null;
    const status: HealthStatus = daysSinceSeen == null || daysSinceSeen > ATRISK_DAYS ? "dormant"
      : daysSinceSeen > ACTIVE_DAYS ? "at-risk" : "active";
    const map = lastMap.get(p.clerkUserId);
    const daysSinceMap = map ? Math.floor((now.getTime() - map.at.getTime()) / DAY) : null;
    const rescoreOverdue = daysSinceMap != null && daysSinceMap >= PERSONAL_RESCORE_DAYS;
    const podCount = myPods.get(p.clerkUserId) ?? 0;
    const mActive = movesActive.get(p.clerkUserId) ?? 0;

    const flags: string[] = [];
    if (!map) flags.push("Never mapped");
    if (podCount === 0) flags.push("No pod");
    if (rescoreOverdue) flags.push("Re-score overdue");
    if (map && mActive === 0 && (movesDone.get(p.clerkUserId) ?? 0) === 0) flags.push("No moves");
    if (status === "dormant") flags.push("Dormant");
    else if (status === "at-risk") flags.push("At risk");

    const attentionScore =
      (status === "dormant" ? 4 : status === "at-risk" ? 2 : 0) +
      (!map ? 3 : 0) + (rescoreOverdue ? 2 : 0) + (podCount === 0 ? 1 : 0) +
      Math.min(3, (daysSinceSeen ?? 60) / 20);

    members.push({
      id: p.clerkUserId, name: p.displayName ?? p.email.split("@")[0], email: p.email,
      avatarUrl: p.avatarUrl, handle: p.handle, careerStage: p.careerStage, lane: p.currentLane,
      status, daysSinceSeen, mapped: !!map, editions: map?.editions ?? 0, rescoreOverdue, daysSinceMap,
      movesActive: mActive, movesDone: movesDone.get(p.clerkUserId) ?? 0,
      posts30: posts30.get(p.clerkUserId) ?? 0, comments30: comments30.get(p.clerkUserId) ?? 0,
      pods: podCount, badges: badges.get(p.clerkUserId) ?? 0, streakDays: p.streakDays,
      flags, attentionScore,
    });
  }

  const summary = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    atRisk: members.filter((m) => m.status === "at-risk").length,
    dormant: members.filter((m) => m.status === "dormant").length,
    overdueRescore: members.filter((m) => m.rescoreOverdue).length,
    neverMapped: members.filter((m) => !m.mapped).length,
    noPod: members.filter((m) => m.pods === 0).length,
  };

  const attention = members.filter((m) => m.flags.length > 0)
    .sort((a, b) => b.attentionScore - a.attentionScore).slice(0, 40);

  // Pod health
  const podMemCount = new Map(podCountRows.map((r) => [r.podId, r.n]));
  const podPost = new Map(podPostRows.map((r) => [r.podId, { n: r.n, last: new Date(r.last) }]));
  const podHealth: PodHealth[] = podRows.map((pd) => {
    const pp = podPost.get(pd.id);
    return {
      id: pd.id, name: pd.name, slug: pd.slug, members: podMemCount.get(pd.id) ?? 0,
      posts30: pp?.n ?? 0, lastPostAt: pp?.last ?? null, dead: (pp?.n ?? 0) === 0,
    };
  }).sort((a, b) => b.members - a.members);

  // What's landing: top recent posts by reactions + comments
  const landing = await topLandingPosts(since30, profRows, podRows);

  return { summary, attention, members: members.sort((a, b) => (a.daysSinceSeen ?? 999) - (b.daysSinceSeen ?? 999)), pods: podHealth, landing };
}

async function topLandingPosts(
  since: Date,
  profRows: (typeof profiles.$inferSelect)[],
  podRows: (typeof pods.$inferSelect)[],
): Promise<LandingPost[]> {
  const recent = await db.select({ id: posts.id, body: posts.body, authorId: posts.authorId, podId: posts.podId, createdAt: posts.createdAt })
    .from(posts).where(gte(posts.createdAt, since)).orderBy(desc(posts.createdAt)).limit(300);
  if (!recent.length) return [];
  const ids = recent.map((r) => r.id);
  const [reactRows, commentRows] = await Promise.all([
    db.select({ postId: reactions.postId, n: num }).from(reactions).where(inArray(reactions.postId, ids)).groupBy(reactions.postId),
    db.select({ postId: comments.postId, n: num }).from(comments).where(inArray(comments.postId, ids)).groupBy(comments.postId),
  ]);
  const react = new Map(reactRows.map((r) => [r.postId, r.n]));
  const comment = new Map(commentRows.map((r) => [r.postId, r.n]));
  const nameById = new Map(profRows.map((p) => [p.clerkUserId, p.displayName ?? p.email.split("@")[0]]));
  const podById = new Map(podRows.map((p) => [p.id, p]));

  return recent
    .map((r) => {
      const rx = react.get(r.id) ?? 0, cx = comment.get(r.id) ?? 0;
      const pod = r.podId ? podById.get(r.podId) : null;
      const href = pod ? `/hub/pods/${pod.slug}#post-${r.id}` : `/hub/community#post-${r.id}`;
      return {
        id: r.id, href, author: nameById.get(r.authorId) ?? "A member", podName: pod?.name ?? "Community",
        snippet: r.body.replace(/\s+/g, " ").slice(0, 120), reactions: rx, comments: cx, createdAt: r.createdAt,
        _score: rx + 2 * cx,
      };
    })
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 6)
    .map(({ _score, ...p }) => p);
}
