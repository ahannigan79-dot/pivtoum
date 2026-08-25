import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates } from "@/db/schema";
import { complete, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { exposureBand, bandWord, type MapComputed } from "@/lib/trajectory";
import { winningAim } from "@/lib/moves";

/**
 * The Map reading — a short, personal, in-Adam's-voice narrative of a member's
 * result, GROUNDED in the deterministically-computed Map (lib/trajectory,
 * lib/exposure). Claude explains what the numbers mean for this exact person; it
 * never recomputes them. Cached per Map snapshot in map_states.narrative.
 */

const SYSTEM = `${VOICE}

## Your task right now
Write the member a short personal reading of their AI Career Map — the kind of thing Adam would say if he sat down with their scorecard for two minutes.

Length: 2–3 short paragraphs, ~90–150 words total. No headings, no lists, no preamble like "Here's your reading". Just talk to them.

Cover, in your own flow (not as labelled sections):
1. Where they stand and what their exposure honestly means for their specific lane — name the real work that's exposed.
2. What's actually working in their favour (their protections / what the machine can't take from their role).
3. The one move that matters most next, tied to their given strategy. End on momentum, not fear.

Ground every claim in the facts provided. The exposure number, band, driver, and strategy are given — use them exactly, never invent others. Second person throughout. Plain text only.`;

/** Compact, already-computed facts handed to Claude — never asks it to score. */
function factSheet(c: MapComputed, overall: number, effortDividend: number): string {
  const band = exposureBand(overall);
  const facts: Record<string, unknown> = {
    career: c.career ?? null,
    lane: c.lane ?? null,
    exposure_now: overall,
    exposure_band: band.word || bandWord(c.band) || null,
    driver: c.driver?.name ?? null, // the biggest single factor behind their exposure
    driver_why: strip(c.driverDetail?.why) || null,
    deepen: strip(c.driverDetail?.down) || null, // what AI can't take, to lean into
    first_action: strip(c.driverDetail?.action) || null,
    strategy_stance: c.move?.stance ?? null,
    aiming_for: winningAim(c.move?.edge2, band.cls),
    second_move: c.move?.edge2 ?? null, // guard | shift | relocate
    urgency: c.urgency?.level ?? null,
  };
  if (c.personal?.laneBaseline != null) {
    facts.lane_average_exposure = c.personal.laneBaseline;
    facts.vs_lane = c.personal.delta ?? 0; // negative = better than lane average
    if (c.personal.helps?.length) facts.working_for_you = c.personal.helps;
    if (c.personal.hurts?.length) facts.holding_you_back = c.personal.hurts;
  }
  if (effortDividend > 0) facts.effort_has_lowered_exposure_by = effortDividend;
  return JSON.stringify(facts, null, 2);
}

const strip = (s: string | undefined | null) => (s ?? "").replace(/<[^>]+>/g, "").trim();

/** Generate the reading (no persistence). Null if unconfigured or on any failure. */
export async function generateMapNarrative(
  computed: MapComputed | null,
  overall: number | null,
  effortDividend = 0,
): Promise<string | null> {
  if (!aiConfigured() || !computed || overall == null) return null;
  return complete({
    system: SYSTEM,
    maxTokens: 700,
    messages: [
      {
        role: "user",
        content:
          `Here is the member's computed Map. Write their reading.\n\n${factSheet(computed, overall, effortDividend)}`,
      },
    ],
  });
}

export type MapRead = { narrative: string; cached: boolean } | null;

/**
 * Return the member's Map reading, generating + caching it on the latest snapshot
 * the first time. Best-effort: returns null when AI is off, there's no map, or a
 * generation fails — callers render the rest of the dashboard regardless.
 */
export async function getOrCreateMapNarrative(userId: string | null, effortDividend = 0): Promise<MapRead> {
  if (!userId) return null;
  const rows = await db
    .select({ id: mapStates.id, computed: mapStates.computed, overall: mapStates.overall, narrative: mapStates.narrative })
    .from(mapStates)
    .where(eq(mapStates.memberId, userId))
    .orderBy(desc(mapStates.createdAt))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.narrative) return { narrative: row.narrative, cached: true };

  const text = await generateMapNarrative(
    (row.computed ?? null) as MapComputed | null,
    typeof row.overall === "number" ? Math.round(row.overall) : null,
    effortDividend,
  );
  if (!text) return null;

  // Persist to this snapshot so we never regenerate for the same Map.
  try {
    await db.update(mapStates).set({ narrative: text }).where(eq(mapStates.id, row.id));
  } catch (err) {
    console.error("[map-narrative] persist failed", String(err));
  }
  return { narrative: text, cached: false };
}
