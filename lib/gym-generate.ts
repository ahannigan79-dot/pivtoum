import "server-only";
import { randomUUID } from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { gymGenerated, mapStates } from "@/db/schema";
import { complete, parseJSON, aiConfigured } from "@/lib/ai";
import { getBuildReps } from "@/lib/build";
import { VOICE } from "@/lib/voice";
import type { Scenario, GymItem, Severity } from "@/lib/gym";

/**
 * Claude-generated Judgment Gym reps. The Gym is content-as-data (lib/gym.ts) —
 * this makes that content infinite: a fresh, on-target scenario for a member's
 * exact lane, graded by the same deterministic scoreLine the hand-authored reps
 * use. Generated scenarios are stored so a rep can be replayed and shared.
 */

const SYSTEM = `${VOICE}

## What you are producing right now
You are writing ONE "Judgment Gym" rep — a training exercise for the community's Build environment.

The premise: an AI has produced a complete, polished, confident piece of professional work for a real brief. Some of it is subtly WRONG in ways that would cost the professional if it shipped. The member reads each part and judges it "Ship" or "Flag" at speed, then gets scored on what they caught and what they let through. This trains Edge 2 — the judgment the machine can't hold.

## The quality bar (this is everything)
- Every item is a distinct part of the deliverable (a section, a number, a claim, a config, a piece of copy).
- Roughly half the items are genuinely CORRECT ("ship") — good work that a nervous reviewer might wrongly flag. Half are genuinely WRONG ("flag").
- A "flag" is never wrong in an obvious, cosmetic way. It is wrong the way real AI output is wrong: it contradicts the brief, breaks a domain rule (a regulation, an accounting standard, a security practice, a legal requirement), gets arithmetic subtly off, invents a fact, accepts a claim without evidence, or omits something mandatory. It looks finished and authoritative.
- A "ship" is genuinely right but often looks like exactly the kind of thing AI hallucinates (an oddly specific number, a bold-sounding claim that actually checks out) — so letting it through takes real confidence.
- Severity on flags: use "critical" for the one or two that carry legal/financial/safety/security accountability; "major" for real damage; "minor" for small leaks (arithmetic, boundary/off-by-one, sloppiness).
- Ground everything in the member's actual lane and a plausible, specific client/brief. Real numbers, real constraints, real stakes for that field.

## Rules
- Exactly 6 items. At least 2 "flag" and at least 2 "ship". Exactly ONE item with severity "critical". Never all-flag or all-ship.
- Do NOT reuse the example clients/briefs the community already has (FreshBowl, Northwind, Meridian, checkout promo codes, admin delete-user). Invent a fresh, believable one for this lane.
- Keep each field tight. \`output\` is the AI's actual work (1–2 sentences or a short snippet). \`why\`, \`cost\`, \`trains\` are one sentence each. \`cost\` is what getting THIS call wrong costs the professional.
- Voice: the framing (thesis, lesson) is Adam's — direct, grounded, no hype, no emoji.

## Output format — STRICT
Return ONLY a JSON object (no prose, no markdown fence) with exactly these keys:
{
  "client": "the subject of the brief — a specific company/matter and what it is",
  "artifact": "a believable deliverable filename, e.g. Acme_Q3_Plan.draft",
  "thesis": "2 sentences framing the rep — the AI produced this, some is subtly wrong, catch it at speed",
  "brief": [ { "l": "short label", "v": "the value" }, ... 4–5 items ],
  "items": [
    { "area": "the part being judged", "output": "what the AI produced", "verdict": "ship" | "flag", "severity": "minor" | "major" | "critical" (ONLY on flag items), "why": "why it's right or wrong", "cost": "what the wrong call costs", "trains": "the judgment muscle it builds" }
    ... exactly 6
  ],
  "lesson": "one closing line naming the couple that would have been the member's to answer for, and the point of the rep"
}`;

type RawItem = {
  area?: string; output?: string; verdict?: string; severity?: string;
  why?: string; cost?: string; trains?: string;
};
type RawScenario = {
  client?: string; artifact?: string; thesis?: string;
  brief?: { l?: string; v?: string }[];
  items?: RawItem[];
  lesson?: string;
};

const SEV: Severity[] = ["minor", "major", "critical"];

/** Validate + normalise the model output into a real Scenario, or null if it doesn't hold. */
function coerce(raw: RawScenario | null, slug: string, career: string): Scenario | null {
  if (!raw || !Array.isArray(raw.items)) return null;

  // Skip malformed items rather than failing the whole rep.
  const items: GymItem[] = [];
  for (const it of raw.items) {
    const verdict = it.verdict === "flag" ? "flag" : it.verdict === "ship" ? "ship" : null;
    if (!verdict || !it.area || !it.output || !it.why || !it.cost || !it.trains) continue;
    const item: GymItem = {
      area: String(it.area), output: String(it.output), verdict,
      why: String(it.why), cost: String(it.cost), trains: String(it.trains),
    };
    if (verdict === "flag") {
      item.severity = SEV.includes(it.severity as Severity) ? (it.severity as Severity) : "major";
    }
    items.push(item);
  }
  if (items.length > 8) items.length = 8;

  const flags = items.filter((i) => i.verdict === "flag");
  const ships = items.filter((i) => i.verdict === "ship");
  // Guardrails that keep the rep scoreable and honest — but forgiving on count.
  if (items.length < 5 || flags.length < 2 || ships.length < 2) return null;
  // Ensure one critical exists (promote the first flag if the model gave none).
  if (!flags.some((f) => f.severity === "critical")) flags[0].severity = "critical";

  const brief = (raw.brief ?? [])
    .filter((b) => b && b.l && b.v)
    .slice(0, 5)
    .map((b) => ({ l: String(b!.l), v: String(b!.v) }));
  if (brief.length < 3 || !raw.client || !raw.thesis || !raw.lesson) return null;

  return {
    slug, career,
    short: `A fresh AI-built deliverable for ${career} — judge it against the brief at speed.`,
    client: String(raw.client),
    artifact: String(raw.artifact ?? `${career.replace(/\s+/g, "_")}_Draft.draft`),
    thesis: String(raw.thesis),
    brief,
    items,
    lesson: String(raw.lesson),
  };
}

/** Generate one fresh scenario for a lane. Retries once (with thinking off, which
 *  avoids truncating the JSON) so it lands reliably. Null only if AI is off or
 *  both attempts fail. */
export async function generateGymScenario(lane: string, career: string): Promise<Scenario | null> {
  if (!aiConfigured()) return null;
  const slug = `gen-${randomUUID()}`;
  const content =
    `Write one Judgment Gym rep for this lane: "${lane}"${career && career !== lane ? ` (career shown to the member: "${career}")` : ""}.\n` +
    `Make the client, brief, and every item specific to the real day-to-day work of this lane. Return only the JSON object.`;

  // Attempt 1: full reasoning. Attempt 2: no thinking, so the whole budget goes to
  // the JSON (the usual cause of a bad first attempt is a truncated response).
  for (const thinking of [true, false]) {
    const raw = await complete({ system: SYSTEM, maxTokens: 6000, thinking, messages: [{ role: "user", content }] });
    const scenario = coerce(parseJSON<RawScenario>(raw ?? ""), slug, career || lane);
    if (scenario) return scenario;
  }
  return null;
}

/** Generate, persist, and return the stored row id (for /hub/build/gym/g/[id]). Null on failure. */
export async function createGeneratedRep(
  userId: string | null,
  lane: string,
  career: string,
): Promise<string | null> {
  const scenario = await generateGymScenario(lane, career);
  if (!scenario) return null;
  const id = randomUUID();
  scenario.slug = `gen-${id}`; // stable per stored rep, so effort logging is distinct
  try {
    await db.insert(gymGenerated).values({ id, memberId: userId, lane, career: career || lane, scenario });
    return id;
  } catch (err) {
    console.error("[gym-generate] persist failed", String(err));
    return null;
  }
}

/**
 * Serve a fresh rep for a lane, catalogue-first: reuse an existing generated rep
 * this member hasn't done yet (no API call), and only generate — and add to the
 * shared catalogue — when they've worked through the pool. Keeps cost bounded to
 * the number of distinct reps a lane needs, shared across everyone in it.
 */
export async function pickOrCreateRep(userId: string | null, lane: string, career: string): Promise<string | null> {
  const done = await getBuildReps(userId); // keys like "gym:gen-<id>"
  const pool = await db
    .select({ id: gymGenerated.id })
    .from(gymGenerated)
    .where(sql`lower(${gymGenerated.lane}) = lower(${lane})`)
    .orderBy(desc(gymGenerated.createdAt))
    .limit(40);
  const unseen = pool.find((r) => !done.has(`gym:gen-${r.id}`));
  if (unseen) return unseen.id; // reuse from the catalogue — free

  return createGeneratedRep(userId, lane, career); // pool exhausted → make a new one
}

export async function getGeneratedRep(id: string): Promise<Scenario | null> {
  try {
    const rows = await db.select({ scenario: gymGenerated.scenario }).from(gymGenerated).where(eq(gymGenerated.id, id)).limit(1);
    return (rows[0]?.scenario ?? null) as Scenario | null;
  } catch {
    return null;
  }
}

/** Resolve the member's lane for a seeded generation: profile-current lane, else latest Map. */
export async function memberLane(userId: string | null): Promise<{ lane: string; career: string } | null> {
  if (!userId) return null;
  const rows = await db
    .select({ computed: mapStates.computed })
    .from(mapStates)
    .where(eq(mapStates.memberId, userId))
    .orderBy(desc(mapStates.createdAt))
    .limit(1);
  const c = (rows[0]?.computed ?? null) as { career?: string; lane?: string } | null;
  if (!c) return null;
  const career = (c.career ?? "").trim();
  const lane = (c.lane ?? "").trim() || career;
  if (!lane) return null;
  return { lane, career: career || lane };
}
