import type { Career } from "@/data/careers";

/* The free "Exposure Check" — band only. We reveal how exposed a role looks and
   why, but never the precise score, the strategy, or the moves. Those are inside. */

export type CheckTone = "red" | "orange" | "yellow" | "lime" | "green";
export type CheckBand = { key: string; word: string; phrase: string; tone: CheckTone; step: number };

/** 5 bands, most-exposed first — `step` is the highlighted segment (0 = most exposed). */
export function bandFromScore(score: number): CheckBand {
  if (score >= 7.5) return { key: "high", word: "High", phrase: "highly exposed", tone: "red", step: 0 };
  if (score >= 6.0) return { key: "mod-high", word: "Moderate–High", phrase: "moderately-to-highly exposed", tone: "orange", step: 1 };
  if (score >= 4.5) return { key: "moderate", word: "Moderate", phrase: "moderately exposed", tone: "yellow", step: 2 };
  if (score >= 3.0) return { key: "low-mod", word: "Low–Moderate", phrase: "lightly-to-moderately exposed", tone: "lime", step: 3 };
  return { key: "low", word: "Low", phrase: "lightly exposed", tone: "green", step: 4 };
}

/** Plain-language drivers keyed to the six scoring factors — no numbers. */
const EXPOSE: Record<string, string> = {
  "How much of this job can AI already do?": "A lot of the core work is already automatable.",
  "Is the path in and up being eroded?": "The way in and up is thinning — the junior rungs go first.",
};
const PROTECT: Record<string, string> = {
  "How often does the job hit genuinely new, high-stakes situations?": "It keeps hitting new, high-stakes calls no model has faced.",
  "Does the law require a licensed human?": "The law still requires a licensed human.",
  "Does someone need a human they can trust and hold responsible?": "Someone needs a human they can trust and hold responsible.",
  "Does it have to be done in person, with your hands?": "Much of it is hands-on and in person — out of the machine's reach.",
};

export type CheckResult = { slug: string; name: string; band: CheckBand; expose: string[]; protect: string[] };

/** Build the band-only check payload for one career. */
export function buildCheck(c: Career): CheckResult {
  const band = bandFromScore(c.headlineScore);
  const exp = c.factors.filter((f) => f.direction === "exposure").sort((a, b) => b.rating - a.rating);
  const pro = c.factors.filter((f) => f.direction === "protection").sort((a, b) => b.rating - a.rating);
  return {
    slug: c.slug, name: c.name, band,
    expose: exp.map((f) => EXPOSE[f.question]).filter(Boolean).slice(0, 2) as string[],
    protect: pro.map((f) => PROTECT[f.question]).filter(Boolean).slice(0, 1) as string[],
  };
}

export const BAND_LABELS = ["High", "Mod–High", "Moderate", "Low–Mod", "Low"];
