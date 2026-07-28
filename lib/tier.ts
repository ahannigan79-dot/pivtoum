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
