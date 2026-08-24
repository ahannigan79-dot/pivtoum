import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { commitments, mapStates, memberBadges } from "@/db/schema";

/** The shape the Map iframe posts as `computed` (see public/tools/winning-map.html). */
export type MapComputed = {
  overall?: number;
  career?: string;
  lane?: string;
  laneScore?: number;
  band?: string;
  driver?: { why?: string; up?: string; down?: string; action?: string };
  lever?: string;
  urgency?: { level?: string; why?: string };
  move?: { stance?: string; edge2?: string; weight?: number; e2short?: string };
};

export type TrajectoryPoint = { at: Date; overall: number };

export type Trajectory = {
  hasMap: boolean;
  computed: MapComputed | null;
  overall: number | null;
  history: TrajectoryPoint[]; // oldest → newest, one per saved Map
  editions: number;
  movesActive: number;
  movesDone: number;
  badgeCount: number;
  lastMapAt: Date | null;
  daysSinceMap: number | null;
  personalRescoreDue: boolean; // personal re-score cadence: every 2 months
};

/** Cadence: members re-score their personal factors every 2 months; Pivotum
 *  re-scores the market baseline every 6. */
export const PERSONAL_RESCORE_DAYS = 60;
export const PIVOTUM_RESCORE_DAYS = 180;

const EMPTY: Trajectory = {
  hasMap: false, computed: null, overall: null, history: [],
  editions: 0, movesActive: 0, movesDone: 0, badgeCount: 0, lastMapAt: null,
  daysSinceMap: null, personalRescoreDue: false,
};

export async function getTrajectory(userId: string | null): Promise<Trajectory> {
  if (!userId) return EMPTY;

  const [maps, moveRows, badgeRows] = await Promise.all([
    db.select({ overall: mapStates.overall, computed: mapStates.computed, at: mapStates.createdAt })
      .from(mapStates).where(eq(mapStates.memberId, userId)).orderBy(asc(mapStates.createdAt)),
    db.select({ status: commitments.status, n: sql<number>`count(*)::int` })
      .from(commitments).where(eq(commitments.memberId, userId)).groupBy(commitments.status),
    db.select({ n: sql<number>`count(*)::int` })
      .from(memberBadges).where(eq(memberBadges.memberId, userId)),
  ]);

  if (!maps.length) {
    // No map yet, but they may still have moves/badges.
    const movesActive = moveRows.find((r) => r.status === "active")?.n ?? 0;
    const movesDone = moveRows.find((r) => r.status === "done")?.n ?? 0;
    return { ...EMPTY, movesActive, movesDone, badgeCount: badgeRows[0]?.n ?? 0 };
  }

  const history: TrajectoryPoint[] = maps
    .filter((m) => typeof m.overall === "number")
    .map((m) => ({ at: m.at, overall: Math.round(m.overall as number) }));
  const last = maps[maps.length - 1];
  const daysSinceMap = Math.floor((Date.now() - last.at.getTime()) / (1000 * 60 * 60 * 24));

  return {
    hasMap: true,
    computed: (last.computed ?? null) as MapComputed | null,
    overall: typeof last.overall === "number" ? Math.round(last.overall) : null,
    history,
    editions: maps.length,
    movesActive: moveRows.find((r) => r.status === "active")?.n ?? 0,
    movesDone: moveRows.find((r) => r.status === "done")?.n ?? 0,
    badgeCount: badgeRows[0]?.n ?? 0,
    lastMapAt: last.at,
    daysSinceMap,
    personalRescoreDue: daysSinceMap >= PERSONAL_RESCORE_DAYS,
  };
}

/** Band → human word (mirrors the Map's bandWord). */
export function bandWord(b: string | undefined | null): string {
  if (!b) return "";
  return ({ moderate: "moderate", "mod-high": "moderate-to-high", high: "high",
    "low-mod": "low-to-moderate", low: "low", "very-low": "very low" } as Record<string, string>)[b] ?? b;
}

/** Exposure → semantic class + word. */
export function exposureBand(n: number | null): { cls: string; word: string } {
  if (n == null) return { cls: "", word: "" };
  if (n >= 65) return { cls: "warn", word: "high" };
  if (n >= 45) return { cls: "mid", word: "moderate" };
  return { cls: "ok", word: "low" };
}
