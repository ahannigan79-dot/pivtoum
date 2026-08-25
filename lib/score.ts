/**
 * The exposure scoring model, in one place.
 *
 *   score = market baseline  +  personal adjustment  −  effort dividend
 *
 * - **Market baseline** is the lane's Pivotum score (`computed.personal.laneBaseline`).
 *   It carries the forces no individual controls — automatability, the ladder — and
 *   moves only when Pivotum re-scores the market. When it moves, the member's earned
 *   improvement (personal + effort) carries forward, so a baseline shift never wipes
 *   the work they've done; only the market half of their number changes.
 * - **Personal adjustment** (`computed.personal.delta`) is what the member can move
 *   by re-scoring their protections — capped at ±10 so it shifts the picture without
 *   overwhelming the baseline.
 * - **Effort dividend** is the slow reward for doing the work. It accrues at most one
 *   point per month and never removes more than 12 in total, so exposure comes down
 *   as a steady journey, not a sprint to zero.
 */

export const PERSONAL_CAP = 10;      // personal factors may move exposure ±10 pts
export const EFFORT_PER_POINT = 30;  // effort points needed to earn one point of dividend
export const EFFORT_FLOOR = 12;      // effort can never remove more than this in total
export const SCORE_MIN = 3;
export const SCORE_MAX = 97;

const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

/** Whole months elapsed since the member's baseline (first Map), as a float. */
export function monthsSince(baselineAt: Date | string | null | undefined): number {
  if (!baselineAt) return 0;
  const t = new Date(baselineAt).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, (Date.now() - t) / MS_PER_MONTH);
}

/**
 * Points the effort dividend has bought down, given effort earned and time elapsed.
 * Rate-limited to ~1/month (one is available immediately, one more each month) and
 * hard-capped at EFFORT_FLOOR — you must both do the work *and* let time pass.
 */
export function effortDividend(effortPoints: number, elapsedMonths: number): number {
  const earned = Math.floor(Math.max(0, effortPoints) / EFFORT_PER_POINT);
  const timeCap = Math.floor(Math.max(0, elapsedMonths)) + 1;
  return Math.max(0, Math.min(earned, timeCap, EFFORT_FLOOR));
}

/** Clamp a raw score into the displayed range. */
export function clampScore(n: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(n)));
}

/** Today's exposure: the member's baseline+personal score, less the effort dividend. */
export function currentExposure(baseExposure: number, dividend: number): number {
  return clampScore(baseExposure - dividend);
}
