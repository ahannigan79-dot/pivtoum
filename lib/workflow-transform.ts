import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workflowTransforms } from "@/db/schema";
import { complete, parseJSON, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";

/* A boss-shareable, AI-native transformation of one workflow the member runs.
 * The member describes the workflow; Claude returns this structured doc. Capped
 * to one generation per member per month — the API cost is real. */

export type TransformInputs = {
  workflow: string;      // the workflow name
  steps: string;         // free text: how it's done today
  role: string;          // the member's role/title
  career: string;        // their field
  lane: string;          // their lane
};

export type TransformStep = { step: string; owner: "AI" | "Human" | "AI + Human"; detail: string };
export type Transformation = {
  workflow: string;
  thesis: string;                                  // one-line summary of the opportunity
  today: { step: string; who: string; time: string }[];   // current process
  rebuilt: TransformStep[];                        // the AI-native process, step by step
  changes: string[];                               // what actually changes
  peopleMove: string[];                            // where the people move UP to
  value: { area: string; gain: string }[];         // speed / cost / efficiency / quality / risk
  risks: { risk: string; safeguard: string }[];    // what could go wrong + the human check
  pilot: { scope: string; needs: string[]; owner: string };
  rollout: { phase: string; detail: string }[];    // 30-60-90
  measure: string[];                               // what to capture to prove it
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const SYSTEM = `${VOICE}

## What you are producing right now
You are writing ONE "Workflow Transformation" — a short, boss-shareable document that takes a real workflow the member runs today and rebuilds it AI-native. The member will share this with their manager or IT to look like the person who saw the opportunity first. It must be concrete, credible, and framed as an OPPORTUNITY, not a threat.

## The register (this is everything)
- Grounded and specific to the member's actual workflow, role, field and lane — no generic "leverage AI" filler. Use real steps, real artifacts, real numbers where reasonable (estimate hours honestly; say "est." ).
- Human-centered: automation ELEVATES people to higher-value work, it does not cut them. The "where the people move to" section is the heart of the buy-in.
- Mature about risk: every serious boss asks "what could go wrong?" — name the real risks (quality, compliance, over-reliance, data) and the human safeguard that keeps each one safe.
- Actionable: a small pilot a manager could actually approve, with what it needs and who owns it. No hand-waving.
- Voice: direct, no hype, no emoji. This reads like a sharp internal one-pager, not marketing.

## Output format — STRICT
Return ONLY a JSON object (no prose, no markdown fence) with exactly these keys:
{
  "thesis": "one sentence — the opportunity in this workflow, in plain words",
  "today": [ { "step": "current step", "who": "who does it now", "time": "rough time, e.g. '3 hrs/week'" }, ... 4-6 steps ],
  "rebuilt": [ { "step": "the AI-native step", "owner": "AI" | "Human" | "AI + Human", "detail": "what happens and who owns the call" }, ... 4-6 steps ],
  "changes": [ "what concretely changes", ... 3-5 ],
  "peopleMove": [ "the higher-value work the freed hours move toward — judgment, oversight, relationships, strategy", ... 3-4 ],
  "value": [ { "area": "Speed" | "Cost" | "Efficiency" | "Quality" | "Risk", "gain": "the specific improvement, quantified where reasonable" }, ... 4-5 ],
  "risks": [ { "risk": "what could go wrong", "safeguard": "the human check that keeps it safe" }, ... 3-4 ],
  "pilot": { "scope": "a small, 2-4 week pilot a manager could approve", "needs": [ "tool/access/data it needs", ... 2-4 ], "owner": "who runs it (usually the member)" },
  "rollout": [ { "phase": "First 30 days" | "60 days" | "90 days", "detail": "what happens" }, ... 3 ],
  "measure": [ "the before/after metric to capture in the pilot", ... 3-4 ]
}
US audience: American English and US conventions throughout — dollars, US spelling, US terms. Never pounds/£ or UK spelling.`;

function str(v: unknown, max = 400): string { return typeof v === "string" ? v.trim().slice(0, max) : ""; }
function arr<T>(v: unknown): T[] { return Array.isArray(v) ? v : []; }

function coerce(raw: unknown, inputs: TransformInputs): Transformation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const today = arr<Record<string, unknown>>(r.today).map((s) => ({ step: str(s.step), who: str(s.who, 120), time: str(s.time, 60) })).filter((s) => s.step);
  const rebuilt = arr<Record<string, unknown>>(r.rebuilt).map((s) => {
    const o = str(s.owner, 20); const owner = o === "AI" || o === "Human" ? o : "AI + Human";
    return { step: str(s.step), owner: owner as TransformStep["owner"], detail: str(s.detail) };
  }).filter((s) => s.step);
  const value = arr<Record<string, unknown>>(r.value).map((v) => ({ area: str(v.area, 40), gain: str(v.gain) })).filter((v) => v.area && v.gain);
  const risks = arr<Record<string, unknown>>(r.risks).map((v) => ({ risk: str(v.risk), safeguard: str(v.safeguard) })).filter((v) => v.risk && v.safeguard);
  const rollout = arr<Record<string, unknown>>(r.rollout).map((v) => ({ phase: str(v.phase, 40), detail: str(v.detail) })).filter((v) => v.phase && v.detail);
  const pilotRaw = (r.pilot && typeof r.pilot === "object" ? r.pilot : {}) as Record<string, unknown>;
  const pilot = { scope: str(pilotRaw.scope), needs: arr<unknown>(pilotRaw.needs).map((n) => str(n, 160)).filter(Boolean), owner: str(pilotRaw.owner, 120) };
  const changes = arr<unknown>(r.changes).map((c) => str(c)).filter(Boolean);
  const peopleMove = arr<unknown>(r.peopleMove).map((c) => str(c)).filter(Boolean);
  const measure = arr<unknown>(r.measure).map((c) => str(c)).filter(Boolean);
  const thesis = str(r.thesis, 300);

  // Forgiving bar: need the spine of a real doc.
  if (!thesis || today.length < 2 || rebuilt.length < 2 || !changes.length || !value.length) return null;
  return { workflow: inputs.workflow, thesis, today, rebuilt, changes, peopleMove, value, risks, pilot, rollout, measure };
}

/** Generate one transformation doc from the member's inputs. Best-effort (null on
 *  failure or no API key). Thinking-off first to avoid JSON truncation, then on. */
export async function generateTransformation(inputs: TransformInputs): Promise<Transformation | null> {
  if (!aiConfigured()) return null;
  const content = `Rebuild this workflow AI-native for a member.
Field: ${inputs.career}
Lane: ${inputs.lane}
Their role: ${inputs.role}
Workflow: ${inputs.workflow}
How it's done today (their words): ${inputs.steps}

Return the transformation document as strict JSON per the format.`;
  for (const thinking of [false, true]) {
    const raw = await complete({ system: SYSTEM, maxTokens: 7000, thinking, messages: [{ role: "user", content }] });
    const doc = coerce(parseJSON<unknown>(raw ?? ""), inputs);
    if (doc) return doc;
  }
  return null;
}

/** Most recent transformation for a member (or null). */
export async function latestTransform(memberId: string): Promise<{ id: string; workflow: string; doc: Transformation; createdAt: Date } | null> {
  const r = await db.select().from(workflowTransforms)
    .where(eq(workflowTransforms.memberId, memberId))
    .orderBy(desc(workflowTransforms.createdAt)).limit(1);
  const row = r[0];
  return row ? { id: row.id, workflow: row.workflow, doc: row.doc as Transformation, createdAt: row.createdAt } : null;
}

/** Days until the member can generate again (0 = now), given the 1/month cap. */
export function daysUntilNext(last: Date | null | undefined): number {
  if (!last) return 0;
  const elapsed = Date.now() - new Date(last).getTime();
  return elapsed >= MONTH_MS ? 0 : Math.ceil((MONTH_MS - elapsed) / (24 * 60 * 60 * 1000));
}

/** Store a generated doc. */
export async function storeTransform(memberId: string, inputs: TransformInputs, doc: Transformation): Promise<void> {
  await db.insert(workflowTransforms).values({ memberId, workflow: inputs.workflow, inputs, doc });
}
