/* ============================================================================
   Guided pod placement (Phase 1c). Rank the pods a new member should see, and
   auto-place them when they don't choose. Matching is best-effort: lane is the
   primary signal, US band (East/West) a soft one, and a "healthy size" nudge so
   newcomers land in a pod with a few people already — never empty, never full.
   ============================================================================ */
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, profiles } from "@/db/schema";
import { type Pod, joinMemberToPod } from "@/lib/pods";

// Captains pick one of four US zones; matching collapses them into two bands.
export const REGION_ZONES = ["Eastern", "Central", "Mountain", "Pacific"] as const;
export const REGION_BANDS = ["East", "West"] as const;

export function bandOf(region: string | null | undefined): "East" | "West" | null {
  if (!region) return null;
  const r = region.toLowerCase();
  if (r.startsWith("east") || r.startsWith("central")) return "East";
  if (r.startsWith("west") || r.startsWith("mountain") || r.startsWith("pacific")) return "West";
  return null;
}

function tokens(s: string | null | undefined): Set<string> {
  return new Set((s ?? "").toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2));
}
function laneScore(memberLane: string | null, memberCareer: string | null, podLane: string | null): number {
  if (!podLane) return 0;
  const mine = new Set([...tokens(memberLane), ...tokens(memberCareer)]);
  let overlap = 0;
  for (const t of tokens(podLane)) if (mine.has(t)) overlap++;
  return overlap;
}

export type PodCandidate = Pod & { memberCount: number; trialCount: number };

type MemberBits = { lane: string | null; career: string | null; band: "East" | "West" | null; isTrial: boolean };
async function memberBits(userId: string): Promise<MemberBits> {
  const rows = await db
    .select({ lane: profiles.currentLane, career: profiles.careerSlug, region: profiles.region, sub: profiles.subStatus })
    .from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1);
  const p = rows[0];
  return { lane: p?.lane ?? null, career: p?.career ?? null, band: bandOf(p?.region), isTrial: p?.sub === "trialing" };
}

async function candidates(includeUnlistable: boolean): Promise<PodCandidate[]> {
  const all = includeUnlistable
    ? await db.select().from(pods)
    : await db.select().from(pods).where(eq(pods.listable, true));
  if (!all.length) return [];
  const ids = all.map((p) => p.id);

  const countRows = await db.select({ podId: podMembers.podId, n: sql<number>`count(*)::int` })
    .from(podMembers).where(sql`${podMembers.auto} = false and ${inArray(podMembers.podId, ids)}`)
    .groupBy(podMembers.podId);
  const counts = new Map(countRows.map((r) => [r.podId, r.n]));

  const trialRows = await db.select({ podId: podMembers.podId, n: sql<number>`count(*)::int` })
    .from(podMembers).innerJoin(profiles, eq(podMembers.memberId, profiles.clerkUserId))
    .where(sql`${podMembers.auto} = false and ${profiles.subStatus} = 'trialing' and ${inArray(podMembers.podId, ids)}`)
    .groupBy(podMembers.podId);
  const trials = new Map(trialRows.map((r) => [r.podId, r.n]));

  return all.map((p) => ({ ...p, memberCount: counts.get(p.id) ?? 0, trialCount: trials.get(p.id) ?? 0 }));
}

function openTo(c: PodCandidate, me: MemberBits): boolean {
  if (c.memberCount >= c.capacity) return false;      // full
  if (me.isTrial && c.trialCount >= 1) return false;  // 1 trial per pod
  return true;
}

function rank(cands: PodCandidate[], me: MemberBits): PodCandidate[] {
  return cands
    .map((p) => {
      const ls = laneScore(me.lane, me.career, p.lane);
      const region = me.band && bandOf(p.region) === me.band ? 1 : 0;
      const health = p.memberCount === 0 ? -1 : p.memberCount <= 5 ? 1 : 0; // prefer a few people, not empty/near-full
      return { p, score: ls * 10 + region * 3 + health };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** The 2–3 pods to offer a member in guided placement. Listable + open only. */
export async function suggestPods(userId: string, limit = 3): Promise<PodCandidate[]> {
  const me = await memberBits(userId);
  const open = (await candidates(false)).filter((c) => openTo(c, me));
  return rank(open, me).slice(0, limit);
}

/** The single best pod to drop a member into when they don't choose. Relaxes to
 *  unlisted pods only if no listable pod has room — never leaves them solo. */
export async function bestPodFor(userId: string): Promise<PodCandidate | null> {
  const me = await memberBits(userId);
  let open = (await candidates(false)).filter((c) => openTo(c, me));
  if (!open.length) open = (await candidates(true)).filter((c) => openTo(c, me));
  return rank(open, me)[0] ?? null;
}

/** Auto-place a member into their best-fit pod. Returns the joined pod slug, or
 *  null if nothing has room (caller decides what to do). Session-independent. */
export async function autoPlaceMember(userId: string): Promise<string | null> {
  const pod = await bestPodFor(userId);
  if (!pod) return null;
  await joinMemberToPod(userId, pod.id);
  return pod.slug;
}
