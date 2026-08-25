import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { laneBaselines, mapStates, profiles } from "@/db/schema";
import type { MapComputed } from "@/lib/trajectory";

export type LaneRow = {
  careerSlug: string;
  lane: string;
  career: string;          // display name (from members' maps, falls back to slug)
  members: number;
  observed: number | null; // the baseline members' maps carry for this lane
  override: number | null; // founder-set baseline (null = using the observed one)
  note: string | null;
  updatedAt: Date | null;
};

/** The founder-set market baseline for a lane, or null when none is set. */
export async function getLaneOverride(careerSlug: string | null | undefined, lane: string | null | undefined): Promise<number | null> {
  if (!careerSlug || !lane) return null;
  const r = await db.select({ baseline: laneBaselines.baseline })
    .from(laneBaselines)
    .where(and(eq(laneBaselines.careerSlug, careerSlug), eq(laneBaselines.lane, lane)))
    .limit(1);
  return r[0]?.baseline ?? null;
}

/** Set (baseline != null) or clear (baseline == null) a lane's market baseline.
 *  Returns the previous baseline so callers can tell whether it actually moved. */
export async function setLaneBaseline(
  careerSlug: string, lane: string, baseline: number | null, note: string | null, by: string,
): Promise<{ previous: number | null }> {
  const previous = await getLaneOverride(careerSlug, lane);
  if (baseline == null) {
    await db.delete(laneBaselines).where(and(eq(laneBaselines.careerSlug, careerSlug), eq(laneBaselines.lane, lane)));
    return { previous };
  }
  await db.insert(laneBaselines)
    .values({ careerSlug, lane, baseline, note, updatedBy: by })
    .onConflictDoUpdate({
      target: [laneBaselines.careerSlug, laneBaselines.lane],
      set: { baseline, note, updatedBy: by, updatedAt: new Date() },
    });
  return { previous };
}

/** Members currently in a lane — used to notify them when the market re-scores. */
export async function membersInLane(careerSlug: string, lane: string): Promise<string[]> {
  const rows = await db.select({ id: profiles.clerkUserId })
    .from(profiles)
    .where(and(eq(profiles.careerSlug, careerSlug), eq(profiles.currentLane, lane)));
  return rows.map((r) => r.id);
}

/** Every occupied lane with its observed baseline, member count and any override —
 *  the founder's market-baseline console. */
export async function listLanes(): Promise<LaneRow[]> {
  const [maps, profs, overrides] = await Promise.all([
    db.select({ memberId: mapStates.memberId, computed: mapStates.computed, at: mapStates.createdAt })
      .from(mapStates).orderBy(desc(mapStates.createdAt)),
    db.select({ id: profiles.clerkUserId, careerSlug: profiles.careerSlug, lane: profiles.currentLane }).from(profiles),
    db.select().from(laneBaselines),
  ]);

  // latest map per member → its lane baseline + career display name
  const latest = new Map<string, MapComputed>();
  for (const m of maps) if (!latest.has(m.memberId)) latest.set(m.memberId, (m.computed ?? {}) as MapComputed);

  const rows = new Map<string, LaneRow>();
  const key = (c: string, l: string) => `${c}|${l}`;
  for (const p of profs) {
    if (!p.careerSlug || !p.lane) continue;
    const comp = latest.get(p.id);
    const observed = typeof comp?.personal?.laneBaseline === "number" ? Math.round(comp.personal.laneBaseline) : null;
    const k = key(p.careerSlug, p.lane);
    const cur = rows.get(k) ?? { careerSlug: p.careerSlug, lane: p.lane, career: comp?.career ?? p.careerSlug, members: 0, observed: null, override: null, note: null, updatedAt: null };
    cur.members += 1;
    if (cur.observed == null && observed != null) cur.observed = observed;
    if ((cur.career === cur.careerSlug || !cur.career) && comp?.career) cur.career = comp.career;
    rows.set(k, cur);
  }
  for (const o of overrides) {
    const k = key(o.careerSlug, o.lane);
    const cur = rows.get(k) ?? { careerSlug: o.careerSlug, lane: o.lane, career: o.careerSlug, members: 0, observed: null, override: null, note: null, updatedAt: null };
    cur.override = o.baseline;
    cur.note = o.note ?? null;
    cur.updatedAt = o.updatedAt;
    rows.set(k, cur);
  }
  return [...rows.values()].sort((a, b) => a.career.localeCompare(b.career) || a.lane.localeCompare(b.lane));
}
