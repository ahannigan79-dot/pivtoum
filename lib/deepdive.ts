import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { careerDeepdives } from "@/db/schema";
import { completeJSON, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { careers, type Career } from "@/data/careers";

/**
 * Self-framed career Deep Dives. The original career profiles were written for
 * parents choosing a kid's path; these are reframed "for all" — for the
 * individual (any age, any stage) mapping their OWN future in a field. Claude
 * writes them grounded in that career's real scores (never recomputing them),
 * cached once per career and shared across all members.
 */

export type DeepDiveSection = { heading: string; body: string };
export type DeepDive = {
  sample: string;                 // the Free Sample — a short, honest preview
  sections: DeepDiveSection[];    // the full Deep Dive
  generatedAt?: string;
};

/** Resolve a member's chosen career (a slug or a display name) to a scored Career. */
export function resolveCareer(slugOrName: string | null | undefined): Career | null {
  if (!slugOrName) return null;
  const key = slugOrName.trim().toLowerCase();
  if (!key) return null;
  return (
    careers.find((c) => c.slug.toLowerCase() === key) ||
    careers.find((c) => c.name.toLowerCase() === key) ||
    careers.find((c) => c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase())) ||
    null
  );
}

export const CAREER_OPTIONS = [...careers]
  .map((c) => ({ slug: c.slug, name: c.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const SYSTEM = `${VOICE}

## What you are writing: a career Deep Dive, reframed for all
A member of the community has chosen a career/field and wants the full picture of how AI is reshaping it — so they can make their own call about their own future in it. Write them a genuinely useful Deep Dive.

Crucial reframing: the underlying analysis was originally written for PARENTS choosing a path for a teenager. You are rewriting it FOR THE INDIVIDUAL THEMSELVES — someone in or considering this field, at any age or stage (studying, early-career, mid-career, senior). Second person, "you" and "your field". Never address a parent, never mention "your kid" or "your teenager".

You are given this career's real scores, tracks (safest to most exposed, with a three-year trend), the six scoring factors, and the questions people ask. These numbers are FACTS — use them exactly, explain what they mean, never recompute or invent different ones.

## Structure — STRICT JSON
Return ONLY a JSON object:
{
  "sample": "the Free Sample — 2–3 short paragraphs, ~110 words. The honest bottom line for this field and the single most important thing to understand, written to make them want the full read. No heading.",
  "sections": [
    { "heading": "short section title", "body": "2–4 short paragraphs of plain text, separated by blank lines" }
    ... 5 to 7 sections
  ]
}

Cover, across the sections (your own titles, in Adam's voice):
- Where this field stands and what the headline score really means for someone in it.
- The tracks within the field — which roles are most protected and which are most exposed, and why (use the track scores).
- What's exposing the field (the exposure factors) — honestly.
- What's protecting it (the protection factors) — the moat, if there is one.
- The trajectory — what the three-year trend says about where this is heading.
- How to win in this field — the renovate-vs-relocate call, and the concrete moves that lower exposure for someone here.

Grounded, direct, no hype, no emoji. Real specifics from the data, not generalities.`;

function factSheet(c: Career): string {
  return JSON.stringify({
    field: c.name,
    headline_score_out_of_10: c.headlineScore,
    headline_track: c.headlineTrack,
    honest_bottom_line: stripMd(c.quickAnswer),
    tracks_safest_to_most_exposed: c.tracks.map((t) => ({
      track: t.name, exposure_2026: t.scores["2026"], trend: `${t.scores["2023"]} → ${t.scores["2025"]} → ${t.scores["2026"]}`, band: t.band,
    })),
    factors: c.factors.map((f) => ({ question: f.question, rating_out_of_10: f.rating, direction: f.direction })),
    strongest_factor: c.workedFactor,
    common_questions: c.faqs.map((f) => ({ q: f.q, a: stripMd(f.a) })),
  }, null, 2);
}

const stripMd = (s: string) => (s ?? "").replace(/\*\*/g, "").trim();

/** Generate a Deep Dive for a career (no persistence). Null if AI off or unusable. */
export async function generateDeepDive(c: Career): Promise<DeepDive | null> {
  if (!aiConfigured()) return null;
  const doc = await completeJSON<DeepDive>({
    system: SYSTEM,
    maxTokens: 5000,
    messages: [{ role: "user", content: `Write the Deep Dive for this field, reframed for the individual.\n\n${factSheet(c)}\n\nReturn only the JSON object.` }],
  });
  if (!doc?.sample?.trim() || !Array.isArray(doc.sections)) return null;
  const sections = doc.sections
    .filter((s) => s && s.heading && s.body)
    .map((s) => ({ heading: String(s.heading), body: String(s.body) }));
  if (sections.length < 3) return null;
  return { sample: doc.sample.trim(), sections };
}

/** Return the Deep Dive for a career, generating + caching it the first time. */
export async function getOrCreateDeepDive(slugOrName: string | null): Promise<{ career: Career; doc: DeepDive } | null> {
  const career = resolveCareer(slugOrName);
  if (!career) return null;

  const rows = await db.select().from(careerDeepdives).where(eq(careerDeepdives.careerSlug, career.slug)).limit(1);
  if (rows[0]) return { career, doc: { ...(rows[0].content as DeepDive), generatedAt: rows[0].createdAt.toISOString() } };

  const doc = await generateDeepDive(career);
  if (!doc) return null;
  try {
    await db.insert(careerDeepdives).values({ careerSlug: career.slug, content: doc }).onConflictDoNothing();
  } catch (err) {
    console.error("[deepdive] persist failed", String(err));
  }
  return { career, doc };
}
