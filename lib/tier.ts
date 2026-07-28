/**
 * The single green→red rule for the landing page. Scores run 1–10 (10 = most
 * exposed), so colour tracks the published band, not "safest in its field":
 *   safe    (green)   Low          — score ≤ 4
 *   mid     (neutral) Moderate     — 4 < score < 6.5
 *   exposed (red)     Mod-High/High — score ≥ 6.5
 * Used on the landing only; document score tables keep their own "notable" tints.
 */
export type Tier = "safe" | "mid" | "exposed";

export function scoreTier(score: number): Tier {
  if (score <= 4) return "safe";
  if (score >= 6.5) return "exposed";
  return "mid";
}

/**
 * Binary green/red flag for a career's headline circle (career pages).
 * Split at 6.5 — the natural gap in the data, so no headline is borderline.
 */
export function headlineFlag(score: number): "safe" | "exposed" {
  return score >= 6.5 ? "exposed" : "safe";
}
