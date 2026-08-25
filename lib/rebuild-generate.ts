import "server-only";
import { randomUUID } from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { rebuildGenerated } from "@/db/schema";
import { complete, parseJSON, aiConfigured } from "@/lib/ai";
import { getBuildReps } from "@/lib/build";
import { VOICE } from "@/lib/voice";
import type { RebuildVariant, RebuildStep } from "@/lib/rebuild";

/**
 * Claude-generated Workflow Rebuilds. The hand-authored library covers only a
 * few careers; this generates a fresh, on-target rebuild for a member's exact
 * lane and workflow, to the same RebuildVariant shape the static ones use — so
 * the shared WorkflowRebuild component (ladder + five moves) renders it unchanged.
 */

const SYSTEM = `${VOICE}

## What you are producing right now
ONE "Workflow Rebuild" for the community's Build environment: a real workflow from the member's lane, shown as it's done TODAY and then rebuilt AI-native — so they can see exactly what the machine takes and where their value climbs.

## The model (follow it exactly)
- Pick a genuine, recognisable core workflow for the lane (or use the one the member names). It must be a real end-to-end process a professional in that lane actually runs.
- Break it into 5–6 sequential steps. For EACH step give four things:
  - today: how it's done now — the manual, time-consuming reality.
  - ai: what an AI-native version does at this step (what the machine takes over).
  - own: the 1–4 word thing that stays the human's at this step (e.g. "the risk call", "brand truth").
  - you: what the human now does instead — the judgment/ownership that moves up a level.
- The throughline: the work moves from producing the output to standing behind it. Be concrete and true to the lane — real artefacts, real stakes, real trade-offs. No hype, no hand-waving.

## Rules
- Do NOT reuse the library's existing examples (month-end close, audit planning, tax return/advisory, paid campaign, performance review, content piece, SEO strategy, ship a feature, incident, data pipeline, business question). Choose a different, believable workflow for this lane.
- Voice for thesis/pull is Adam's — direct, grounded, no emoji, no exclamation marks.

## Output — STRICT
Return ONLY a JSON object (no prose, no fence) with exactly:
{
  "title": "the workflow, as a short verb phrase — e.g. 'Run a patient intake'",
  "field": "the sub-area of the lane it sits in — e.g. 'Clinical operations'",
  "short": "one-line card blurb of the workflow",
  "thesis": "2 sentences: this is the workflow today, then rebuilt AI-native; watch what the machine takes and where the human moves up",
  "steps": [
    { "label": "step name", "today": "how it's done now", "own": "1–4 words that stay human", "ai": "what AI does at this step", "you": "what the human now does instead" }
    ... 5 or 6
  ],
  "delta": [ { "v": "before → after, e.g. 'Days → hours'", "l": "what it measures" } ... 2 or 3 ],
  "pull": "one closing line — where the work (and the accountability) really moves to"
}`;

type RawStep = { label?: string; today?: string; own?: string; ai?: string; you?: string };
type RawVariant = {
  title?: string; field?: string; short?: string; thesis?: string;
  steps?: RawStep[]; delta?: { v?: string; l?: string }[]; pull?: string;
};

function coerce(raw: RawVariant | null, slug: string): RebuildVariant | null {
  if (!raw || !Array.isArray(raw.steps) || raw.steps.length < 4) return null;
  const steps: RebuildStep[] = [];
  for (const s of raw.steps.slice(0, 6)) {
    if (!s.label || !s.today || !s.own || !s.ai || !s.you) return null;
    steps.push({ label: String(s.label), today: String(s.today), own: String(s.own), ai: String(s.ai), you: String(s.you) });
  }
  if (steps.length < 4) return null;

  const delta = (raw.delta ?? [])
    .filter((d) => d && d.v && d.l)
    .slice(0, 3)
    .map((d) => ({ v: String(d!.v), l: String(d!.l) }));
  if (delta.length < 2 || !raw.title || !raw.thesis || !raw.pull) return null;

  return {
    slug, title: String(raw.title), field: String(raw.field ?? "").trim() || "Core workflow",
    short: String(raw.short ?? "").trim() || String(raw.title),
    thesis: String(raw.thesis), steps, delta, pull: String(raw.pull),
  };
}

/** Generate one fresh rebuild for a lane (optionally a specific workflow). Retries
 *  once with thinking off (avoids truncating the JSON). Null only if AI is off or
 *  both attempts fail. */
export async function generateRebuildVariant(lane: string, career: string, workflow?: string): Promise<RebuildVariant | null> {
  if (!aiConfigured()) return null;
  const slug = `gen-${randomUUID()}`;
  const content =
    `Build one Workflow Rebuild for this lane: "${lane}"${career && career !== lane ? ` (career: "${career}")` : ""}.\n` +
    (workflow?.trim() ? `Use this specific workflow: "${workflow.trim()}".\n` : "Choose the most representative core workflow for the lane.\n") +
    `Make every step specific to the real work of this lane. Return only the JSON object.`;

  for (const thinking of [true, false]) {
    const raw = await complete({ system: SYSTEM, maxTokens: 6000, thinking, messages: [{ role: "user", content }] });
    const variant = coerce(parseJSON<RawVariant>(raw ?? ""), slug);
    if (variant) return variant;
  }
  return null;
}

/**
 * Serve a fresh rebuild, catalogue-first: reuse one this member hasn't done yet
 * (no API call), and only generate when they've worked through the pool — unless
 * they named a specific workflow, which always generates that one.
 */
export async function pickOrCreateRebuild(userId: string | null, lane: string, career: string, workflow?: string): Promise<string | null> {
  if (!workflow?.trim()) {
    const done = await getBuildReps(userId); // keys like "rebuild:gen-<id>"
    const pool = await db
      .select({ id: rebuildGenerated.id })
      .from(rebuildGenerated)
      .where(sql`lower(${rebuildGenerated.lane}) = lower(${lane})`)
      .orderBy(desc(rebuildGenerated.createdAt))
      .limit(40);
    const unseen = pool.find((r) => !done.has(`rebuild:gen-${r.id}`));
    if (unseen) return unseen.id;
  }
  return createGeneratedRebuild(userId, lane, career, workflow);
}

export async function createGeneratedRebuild(
  userId: string | null,
  lane: string,
  career: string,
  workflow?: string,
): Promise<string | null> {
  const variant = await generateRebuildVariant(lane, career, workflow);
  if (!variant) return null;
  const id = randomUUID();
  variant.slug = `gen-${id}`; // stable per stored rebuild → distinct effort logging
  try {
    await db.insert(rebuildGenerated).values({ id, memberId: userId, lane, career: career || lane, variant });
    return id;
  } catch (err) {
    console.error("[rebuild-generate] persist failed", String(err));
    return null;
  }
}

export async function getGeneratedRebuild(id: string): Promise<{ variant: RebuildVariant; career: string } | null> {
  try {
    const rows = await db
      .select({ variant: rebuildGenerated.variant, career: rebuildGenerated.career })
      .from(rebuildGenerated)
      .where(eq(rebuildGenerated.id, id))
      .limit(1);
    const r = rows[0];
    return r ? { variant: r.variant as RebuildVariant, career: r.career } : null;
  } catch {
    return null;
  }
}
