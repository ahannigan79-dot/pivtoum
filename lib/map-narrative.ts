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
Explain this member's AI Career Map to them in plain, natural English — the way you'd talk it through sitting next to them, not the way an article is written. The goal is that they finish reading and clearly understand where they stand and what to do.

Length: exactly 3 short paragraphs, ~110–150 words total. No headings, no lists, no preamble like "Here's your reading". Just talk to them, simply.

Say one clear thing per paragraph:
1. What their exposure score actually means for them in everyday terms — is this reassuring or worrying, and why. Name the real work AI is taking, in plain words.
2. What's keeping them safe — the parts of their job AI genuinely can't do.
3. The single most useful thing to do next, from their strategy. End plainly and encouragingly — no slogan.

If the facts include "changing_lanes": they are moving FROM moving_from_lane TOWARD target_lane (the scored lane). Frame the whole reading around that move — paragraph 1 contrasts where they are now with where they're heading (use current_lane_exposure vs exposure_now), paragraph 2 is what they carry across and what the target lane rewards, and paragraph 3 is the bridge from strategy_line: go AI-native in the current work now, build what the target lane runs on. Never imply they're stuck where they are.

Write so they understand it on the first read. Ordinary words, complete sentences, no clever turns of phrase. Ground every claim in the facts provided — use the given score, band, driver and strategy exactly, never invent others. Second person throughout. Plain text only.`;

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
    strategy_line: strip(c.move?.line) || null, // the winning-move framing, in plain words
    aiming_for: winningAim(c.move?.edge2, band.cls),
    second_move: c.move?.edge2 ?? null, // guard | shift | relocate
    urgency: c.urgency?.level ?? null,
  };
  // Career-change: they're moving FROM their current lane TOWARD a more protected
  // target (c.lane is the target). Tell Claude so the read is about the bridge.
  if (c.changing && c.fromLane) {
    facts.changing_lanes = true;
    facts.moving_from_lane = c.fromLane;
    if (c.fromScore != null) facts.current_lane_exposure = Math.round(c.fromScore * 10);
    facts.target_lane = c.lane ?? null; // where they're heading (already the scored lane)
  }
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
export async function getOrCreateMapNarrative(userId: string | null, effortDividend = 0, force = false): Promise<MapRead> {
  if (!userId) return null;
  const rows = await db
    .select({ id: mapStates.id, computed: mapStates.computed, overall: mapStates.overall, narrative: mapStates.narrative })
    .from(mapStates)
    .where(eq(mapStates.memberId, userId))
    .orderBy(desc(mapStates.createdAt))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.narrative && !force) return { narrative: row.narrative, cached: true };

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
