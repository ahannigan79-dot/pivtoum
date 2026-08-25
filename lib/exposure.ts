import type { Career } from "@/data/careers";

/* The free "Exposure Check" — band only. We reveal how exposed a role looks and
   why, but never the precise score, the strategy, or the moves. Those are inside. */

export type CheckTone = "red" | "orange" | "yellow" | "lime" | "green";
export type CheckBand = { key: string; word: string; phrase: string; tone: CheckTone; step: number };

/** 5 bands, most-exposed first — `step` is the highlighted segment (0 = most exposed). */
export const BANDS: CheckBand[] = [
  { key: "high", word: "High", phrase: "highly exposed", tone: "red", step: 0 },
  { key: "mod-high", word: "Moderate–High", phrase: "moderately-to-highly exposed", tone: "orange", step: 1 },
  { key: "moderate", word: "Moderate", phrase: "moderately exposed", tone: "yellow", step: 2 },
  { key: "low-mod", word: "Low–Moderate", phrase: "lightly-to-moderately exposed", tone: "lime", step: 3 },
  { key: "low", word: "Low", phrase: "lightly exposed", tone: "green", step: 4 },
];

const clampStep = (s: number) => Math.max(0, Math.min(4, s));

export function bandFromScore(score: number): CheckBand {
  const step = score >= 7.5 ? 0 : score >= 6.0 ? 1 : score >= 4.5 ? 2 : score >= 3.0 ? 3 : 4;
  return BANDS[step];
}
export function bandByStep(step: number): CheckBand {
  return BANDS[clampStep(step)];
}

/* Two quick taps personalise the band by at most one step — the role still anchors it. */
export type Seniority = "student" | "early" | "mid" | "senior" | "leader";
export type Routine = "repeatable" | "mix" | "judgment";

/** Nudge the role's band step by the personal taps (net ±1, 0 = most exposed). */
export function tunedStep(baseStep: number, seniority: Seniority, routine: Routine): number {
  const r = routine === "repeatable" ? -1 : routine === "judgment" ? 1 : 0; // repeatable = more exposed
  const s = seniority === "early" || seniority === "student" ? -0.5 : seniority === "senior" || seniority === "leader" ? 0.5 : 0;
  const net = Math.max(-1, Math.min(1, Math.round(r + s)));
  return clampStep(baseStep + net);
}

/** Personal "why" lines from the taps, layered on top of the role's factors. */
export function personalWhy(seniority: Seniority, routine: Routine): { expose: string[]; protect: string[] } {
  const expose: string[] = [], protect: string[] = [];
  if (routine === "repeatable") expose.push("Most of your day is repeatable work AI can already do.");
  if (routine === "judgment") protect.push("Your day leans on judgment calls the model can't own.");
  if (seniority === "student") expose.push("You're still studying — you'll enter a market AI is already reshaping.");
  if (seniority === "early") expose.push("You're early — still building the judgment that protects you.");
  if (seniority === "leader") protect.push("You set the direction; you don't just execute it.");
  return { expose, protect };
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
