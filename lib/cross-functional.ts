/* Server-side mirror of the Map tool's cross-functional field
   (public/tools/winning-map.html → CAREERS "cross-functional").

   Cross-domain roles — PM, product manager, consultant, analyst, coordinator,
   ops — mean different things by domain, so the Map scores them in their own
   field with per-role tracks. Members are scored client-side and their numbers
   are saved verbatim, so this mirror is NOT used to re-score anyone. Its job is
   market management: it gives the founder's Market-baselines console the field's
   lanes and their Pivotum default baselines even before a member occupies one,
   so a market baseline can be set proactively.

   Baseline is the Map's own conversion: laneBaseline = round(score × 10)
   (winning-map.html). Keep these in lockstep with the tool's track scores. */

export const CROSS_FUNCTIONAL_SLUG = "cross-functional";
export const CROSS_FUNCTIONAL_NAME = "Cross-functional & delivery";

export type CrossFunctionalTrack = { lane: string; score: number; baseline: number; band: string };

// score = the tool's `s` (0–10 exposure); baseline = round(score × 10) on the
// 0–100 scale the market console uses. Mirrors winning-map.html verbatim.
export const CROSS_FUNCTIONAL_TRACKS: CrossFunctionalTrack[] = [
  { lane: "Operations management",          score: 5.0, baseline: 50, band: "moderate" },
  { lane: "Program / delivery management",  score: 5.3, baseline: 53, band: "moderate" },
  { lane: "Management consulting",          score: 5.3, baseline: 53, band: "moderate" },
  { lane: "Project management",             score: 5.6, baseline: 56, band: "moderate" },
  { lane: "Product management",             score: 6.0, baseline: 60, band: "moderate" },
  { lane: "Business analysis",              score: 7.3, baseline: 73, band: "high" },
  { lane: "Coordination / administration",  score: 7.5, baseline: 75, band: "high" },
];
