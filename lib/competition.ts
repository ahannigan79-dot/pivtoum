import "server-only";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { pods, podMembers, podCheckins, moveArtifacts } from "@/db/schema";

/* The Pod Competition. Pods compete on doing the work together: showing up
 * (check-in participation) and shipping VERIFIED moves. Monthly leaderboard →
 * a smaller monthly prize; a six-month season → the grand winning pod.
 *
 * A move only scores once a domain leader has verified its artifact — the honor
 * system has teeth here, so the competition can't be gamed by clicking through
 * steps. Score is per-capita so a small pod competes fairly with a big one, and
 * participation (the whole point of a pod) is the spine of it. Computed live
 * from existing activity — no separate scoring table to keep in sync. */

const WEEKS_PER_MONTH = 4.3;

export type PodScore = {
  slug: string; name: string; crest: string | null;
  members: number; score: number;
  participation: number; // 0–100, share of possible weekly check-ins
  moves: number;
};

export type Season = { year: number; half: 1 | 2; label: string; months: { year: number; month0: number }[] };

/** The six-month season containing `now` — calendar halves (H1 Jan–Jun, H2 Jul–Dec). */
export function seasonOf(now: Date = new Date()): Season {
  const y = now.getUTCFullYear();
  const half: 1 | 2 = now.getUTCMonth() < 6 ? 1 : 2;
  const startM = half === 1 ? 0 : 6;
  const months = Array.from({ length: 6 }, (_, i) => ({ year: y, month0: startM + i }));
  return { year: y, half, label: `${half === 1 ? "H1" : "H2"} ${y}`, months };
}

export function monthLabel(year: number, month0: number): string {
  return new Date(Date.UTC(year, month0, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Score every pod for one calendar month. */
async function scoreMonth(year: number, month0: number): Promise<Map<string, PodScore>> {
  const start = new Date(Date.UTC(year, month0, 1));
  const end = new Date(Date.UTC(year, month0 + 1, 1));
  const allPods = await db.select().from(pods);
  if (!allPods.length) return new Map();
  const ids = allPods.map((p) => p.id);

  // Non-auto membership → pod rosters + a member→pods reverse map.
  const memRows = await db.select({ podId: podMembers.podId, memberId: podMembers.memberId })
    .from(podMembers).where(and(eq(podMembers.auto, false), inArray(podMembers.podId, ids)));
  const roster = new Map<string, string[]>();
  for (const r of memRows) (roster.get(r.podId) ?? roster.set(r.podId, []).get(r.podId)!).push(r.memberId);

  // Check-ins in the month, per pod (podCheckins carries podId directly).
  const ciRows = await db.select({ podId: podCheckins.podId, n: sql<number>`count(*)::int` })
    .from(podCheckins)
    .where(and(inArray(podCheckins.podId, ids), gte(podCheckins.createdAt, start), lt(podCheckins.createdAt, end)))
    .groupBy(podCheckins.podId);
  const checkins = new Map(ciRows.map((r) => [r.podId, r.n]));

  // Verified moves in the month, per member — a move counts for the competition
  // only once a domain leader has verified its artifact (bucketed by verify time).
  const vaRows = await db.select({ memberId: moveArtifacts.memberId, n: sql<number>`count(*)::int` })
    .from(moveArtifacts)
    .where(and(eq(moveArtifacts.status, "verified"), gte(moveArtifacts.reviewedAt, start), lt(moveArtifacts.reviewedAt, end)))
    .groupBy(moveArtifacts.memberId);
  const movesBy = new Map<string, number>();
  for (const r of vaRows) movesBy.set(r.memberId, (movesBy.get(r.memberId) ?? 0) + r.n);

  const out = new Map<string, PodScore>();
  for (const p of allPods) {
    const mem = roster.get(p.id) ?? [];
    const size = mem.length;
    if (size === 0) { out.set(p.slug, { slug: p.slug, name: p.name, crest: p.crest, members: 0, score: 0, participation: 0, moves: 0 }); continue; }
    const participation = Math.min(1, (checkins.get(p.id) ?? 0) / (size * WEEKS_PER_MONTH));
    let moves = 0;
    for (const mId of mem) moves += movesBy.get(mId) ?? 0;
    // Participation is the spine (0–100); moves shipped is a per-capita booster.
    const score = Math.round(100 * participation + 15 * (moves / size));
    out.set(p.slug, { slug: p.slug, name: p.name, crest: p.crest, members: size, score, participation: Math.round(participation * 100), moves });
  }
  return out;
}

/** This month's leaderboard — the monthly-prize race. Occupied pods only. */
export async function monthlyLeaderboard(now: Date = new Date()): Promise<PodScore[]> {
  const m = await scoreMonth(now.getUTCFullYear(), now.getUTCMonth());
  return [...m.values()].filter((p) => p.members > 0).sort((a, b) => b.score - a.score);
}

/** The season race so far — cumulative across the season's elapsed months. */
export async function seasonLeaderboard(now: Date = new Date()): Promise<PodScore[]> {
  const { months } = seasonOf(now);
  const elapsed = months.filter((x) => x.year < now.getUTCFullYear() || x.month0 <= now.getUTCMonth());
  const agg = new Map<string, PodScore>();
  for (const { year, month0 } of elapsed) {
    const m = await scoreMonth(year, month0);
    for (const [slug, s] of m) {
      const cur = agg.get(slug) ?? { ...s, score: 0, moves: 0, participation: 0 };
      cur.score += s.score; cur.moves += s.moves; cur.members = s.members;
      agg.set(slug, cur);
    }
  }
  return [...agg.values()].filter((p) => p.members > 0).sort((a, b) => b.score - a.score);
}

export type MyStanding = { slug: string; name: string; monthRank: number; seasonRank: number; total: number; monthScore: number };

/** Where the member's pod sits — this month and this season — for the dashboard. */
export async function myPodStanding(userId: string | null, now: Date = new Date()): Promise<MyStanding | null> {
  if (!userId) return null;
  const mine = await db.select({ slug: pods.slug, name: pods.name }).from(podMembers)
    .innerJoin(pods, eq(podMembers.podId, pods.id))
    .where(and(eq(podMembers.memberId, userId), eq(podMembers.auto, false))).limit(1);
  const pod = mine[0];
  if (!pod) return null;
  const [month, season] = await Promise.all([monthlyLeaderboard(now), seasonLeaderboard(now)]);
  const monthRank = month.findIndex((p) => p.slug === pod.slug) + 1;
  const seasonRank = season.findIndex((p) => p.slug === pod.slug) + 1;
  const monthScore = month.find((p) => p.slug === pod.slug)?.score ?? 0;
  return { slug: pod.slug, name: pod.name, monthRank: monthRank || month.length + 1, seasonRank: seasonRank || season.length + 1, total: month.length, monthScore };
}
