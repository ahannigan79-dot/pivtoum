import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { mapStates, memberBadges, podMembers, pods, posts, profiles } from "@/db/schema";
import type { MapComputed } from "@/lib/trajectory";

export type DirectoryMember = {
  id: string; name: string; handle: string | null; avatarUrl: string | null; role: string;
  bio: string | null; career: string | null; lane: string | null; stage: string | null;
  strategy: string | null; pods: string[];
  overall: number | null; badgeCount: number;
};

/** URL id for a member — handle if they have one, else their user id. */
export function memberSlug(p: { handle: string | null; clerkUserId: string }): string {
  return p.handle ?? p.clerkUserId;
}

/** Slug → readable career name (e.g. "computer-science" → "Computer Science"). */
export function humanizeCareer(slug: string | null): string | null {
  if (!slug) return null;
  return slug.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function displayName(p: typeof profiles.$inferSelect): string {
  return p.displayName ?? p.email.split("@")[0];
}

type LatestMap = { overall: number | null; strategy: string | null };

/** Latest map summary per member (exposure + winning strategy). */
async function latestMapByMember(): Promise<Map<string, LatestMap>> {
  const rows = await db
    .select({ memberId: mapStates.memberId, overall: mapStates.overall, computed: mapStates.computed })
    .from(mapStates).orderBy(desc(mapStates.createdAt));
  const out = new Map<string, LatestMap>();
  for (const r of rows) {
    if (out.has(r.memberId)) continue;
    const c = (r.computed ?? null) as MapComputed | null;
    out.set(r.memberId, {
      overall: typeof r.overall === "number" ? Math.round(r.overall) : null,
      strategy: c?.move?.stance ?? null,
    });
  }
  return out;
}

/** Pod names per member. */
async function podsByMember(): Promise<Map<string, string[]>> {
  const rows = await db
    .select({ memberId: podMembers.memberId, name: pods.name })
    .from(podMembers).innerJoin(pods, eq(podMembers.podId, pods.id));
  const out = new Map<string, string[]>();
  for (const r of rows) {
    const list = out.get(r.memberId) ?? [];
    list.push(r.name);
    out.set(r.memberId, list);
  }
  return out;
}

export async function getDirectory(): Promise<DirectoryMember[]> {
  const [people, maps, badgeRows, memberPods] = await Promise.all([
    db.select().from(profiles).orderBy(desc(profiles.createdAt)),
    latestMapByMember(),
    db.select({ memberId: memberBadges.memberId, n: sql<number>`count(*)::int` })
      .from(memberBadges).groupBy(memberBadges.memberId),
    podsByMember(),
  ]);
  const badges = new Map(badgeRows.map((r) => [r.memberId, r.n]));

  return people.map((p) => {
    const m = maps.get(p.clerkUserId);
    return {
      id: memberSlug(p), name: displayName(p), handle: p.handle, avatarUrl: p.avatarUrl, role: p.role,
      bio: p.bio, career: p.careerSlug, lane: p.currentLane, stage: p.careerStage,
      strategy: m?.strategy ?? null, pods: memberPods.get(p.clerkUserId) ?? [],
      overall: m?.overall ?? null, badgeCount: badges.get(p.clerkUserId) ?? 0,
    };
  });
}

export type MemberProfile = {
  clerkUserId: string; name: string; handle: string | null; avatarUrl: string | null; role: string;
  bio: string | null; career: string | null; lane: string | null; stage: string | null;
  overall: number | null; computed: MapComputed | null;
  pods: { name: string; slug: string }[];
  recentPosts: { id: string; body: string; createdAt: Date }[];
  isMe: boolean; mapVisible: boolean;
};

/** Resolve a member by handle or user id, with their public profile data. */
export async function getMemberProfile(idOrHandle: string, meId: string | null): Promise<MemberProfile | null> {
  const rows = await db.select().from(profiles)
    .where(sql`${profiles.handle} = ${idOrHandle} OR ${profiles.clerkUserId} = ${idOrHandle}`).limit(1);
  const p = rows[0];
  if (!p) return null;

  const [maps, podRows, postRows] = await Promise.all([
    db.select({ overall: mapStates.overall, computed: mapStates.computed })
      .from(mapStates).where(eq(mapStates.memberId, p.clerkUserId)).orderBy(desc(mapStates.createdAt)).limit(1),
    db.select({ name: pods.name, slug: pods.slug }).from(podMembers)
      .innerJoin(pods, eq(podMembers.podId, pods.id)).where(eq(podMembers.memberId, p.clerkUserId)),
    db.select({ id: posts.id, body: posts.body, createdAt: posts.createdAt }).from(posts)
      .where(eq(posts.authorId, p.clerkUserId)).orderBy(desc(posts.createdAt)).limit(5),
  ]);
  const latest = maps[0];
  const isMe = meId === p.clerkUserId;
  // The owner controls whether their exposure/map shows on their public profile.
  const mapVisible = isMe || p.showMap;

  return {
    clerkUserId: p.clerkUserId, name: displayName(p), handle: p.handle, avatarUrl: p.avatarUrl, role: p.role,
    bio: p.bio, career: p.careerSlug, lane: p.currentLane, stage: p.careerStage,
    overall: mapVisible && typeof latest?.overall === "number" ? Math.round(latest.overall) : null,
    computed: mapVisible ? ((latest?.computed ?? null) as MapComputed | null) : null,
    pods: podRows, recentPosts: postRows, isMe, mapVisible,
  };
}

/** Is a handle free (for the given member to claim)? */
export async function handleTaken(handle: string, exceptUserId: string): Promise<boolean> {
  const rows = await db.select({ id: profiles.clerkUserId }).from(profiles)
    .where(and(eq(profiles.handle, handle), ne(profiles.clerkUserId, exceptUserId))).limit(1);
  return rows.length > 0;
}
