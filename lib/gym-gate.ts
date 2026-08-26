import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { gymAttempts, memberWeeks } from "@/db/schema";

/**
 * The Judgment-Gym gate on the Effort Dividend.
 *
 * A member earns one Effort-Dividend point for a month when they:
 *   1. pass ≥ REQUIRED_PASSES distinct reps that month (score ≥ PASS_PCT), and
 *   2. are active in ≥ REQUIRED_WEEKS distinct weeks that month.
 *
 * The dividend is the count of qualifying months, capped at DIVIDEND_CAP — so it
 * accrues at most one point per month and never removes more than 12 in total,
 * matching lib/score.ts. Freshness comes from a rotating window: LIVE_PER_MONTH
 * reps are "live" each month, rotating deterministically through the career's
 * full pool (see liveRepSlugs).
 */

export const PASS_PCT = 75;
export const REQUIRED_PASSES = 8;
export const REQUIRED_WEEKS = 3;
export const LIVE_PER_MONTH = 8;
export const DIVIDEND_CAP = 12;

// ---- time keys (UTC, stable across server timezones) ----------------------

export function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStart(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // to the week's Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ---- the monthly rotation (the "shuffle") ---------------------------------

/** Months since a fixed epoch — the rotation index, so the live set advances by
 *  one each calendar month without any founder action. */
function monthIndex(d = new Date()): number {
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

/**
 * The reps that are "live" this month for a career, given its full pool of slugs.
 * A deterministic rotating window of LIVE_PER_MONTH, advancing one step each
 * month, so members meet a fresh set and cycle through the whole pool over time.
 * Pools smaller than the window return everything.
 */
export function liveRepSlugs(allSlugs: string[], d = new Date()): string[] {
  const n = allSlugs.length;
  if (n <= LIVE_PER_MONTH) return [...allSlugs];
  const start = ((monthIndex(d) % n) + n) % n;
  const out: string[] = [];
  for (let i = 0; i < LIVE_PER_MONTH; i++) out.push(allSlugs[(start + i) % n]);
  return out;
}

// ---- recording ------------------------------------------------------------

/** Record one graded rep attempt. */
export async function recordGymAttempt(memberId: string, career: string, repSlug: string, pct: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  await db.insert(gymAttempts).values({ memberId, career, repSlug, pct: clamped, passed: clamped >= PASS_PCT });
}

/** Mark the member present for the current ISO week (idempotent per week). */
export async function recordWeek(memberId: string): Promise<void> {
  await db.insert(memberWeeks).values({ memberId, week: isoWeekKey() }).onConflictDoNothing();
}

// ---- reading the gate -----------------------------------------------------

export type MonthProgress = {
  passed: number;          // distinct reps passed this month
  weeksActive: number;     // distinct weeks present this month
  repsNeeded: number;      // REQUIRED_PASSES
  weeksNeeded: number;     // REQUIRED_WEEKS
  qualified: boolean;      // both thresholds met → this month earns a point
};

/** This month's progress toward the dividend point. */
export async function monthProgress(memberId: string | null | undefined): Promise<MonthProgress> {
  const base: MonthProgress = { passed: 0, weeksActive: 0, repsNeeded: REQUIRED_PASSES, weeksNeeded: REQUIRED_WEEKS, qualified: false };
  if (!memberId) return base;
  const start = monthStart();
  const [passRows, weekRows] = await Promise.all([
    db.select({ n: sql<number>`count(distinct ${gymAttempts.repSlug})::int` })
      .from(gymAttempts)
      .where(and(eq(gymAttempts.memberId, memberId), eq(gymAttempts.passed, true), gte(gymAttempts.createdAt, start))),
    db.select({ n: sql<number>`count(*)::int` })
      .from(memberWeeks)
      .where(and(eq(memberWeeks.memberId, memberId), gte(memberWeeks.createdAt, start))),
  ]);
  const passed = passRows[0]?.n ?? 0;
  const weeksActive = weekRows[0]?.n ?? 0;
  return { ...base, passed, weeksActive, qualified: passed >= REQUIRED_PASSES && weeksActive >= REQUIRED_WEEKS };
}

/**
 * How many distinct months the member has qualified — the Effort-Dividend point
 * count, capped at DIVIDEND_CAP. A month qualifies when its distinct passed reps
 * and distinct active weeks both clear their thresholds.
 */
export async function qualifyingMonths(memberId: string | null | undefined): Promise<number> {
  if (!memberId) return 0;
  const [passByMonth, weeksByMonth] = await Promise.all([
    db.select({
      m: sql<string>`to_char(${gymAttempts.createdAt} at time zone 'UTC', 'YYYY-MM')`,
      n: sql<number>`count(distinct ${gymAttempts.repSlug})::int`,
    }).from(gymAttempts).where(and(eq(gymAttempts.memberId, memberId), eq(gymAttempts.passed, true))).groupBy(sql`1`),
    db.select({
      m: sql<string>`to_char(${memberWeeks.createdAt} at time zone 'UTC', 'YYYY-MM')`,
      n: sql<number>`count(*)::int`,
    }).from(memberWeeks).where(eq(memberWeeks.memberId, memberId)).groupBy(sql`1`),
  ]);
  const weeks = new Map(weeksByMonth.map((r) => [r.m, r.n]));
  let months = 0;
  for (const r of passByMonth) {
    if (r.n >= REQUIRED_PASSES && (weeks.get(r.m) ?? 0) >= REQUIRED_WEEKS) months++;
  }
  return Math.min(months, DIVIDEND_CAP);
}
