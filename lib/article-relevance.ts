import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articleRelevance, mapStates } from "@/db/schema";
import { complete, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { exposureBand, bandWord, type MapComputed } from "@/lib/trajectory";
import { articleRef } from "@/lib/brief";

/**
 * "Why this matters to you" — a one-line, per-member reading of the week's
 * highlighted article, tied to the member's own lane and exposure. Turns a
 * broadcast article into a personal nudge. Grounded in the member's computed Map
 * (never recomputes it) and cached per (member, article) so it's generated once.
 */

const SYSTEM = `${VOICE}

## Your task right now
The community is highlighting one article this week. Write ONE short note to a specific member explaining why THIS article matters for THEIR lane and exposure — turning a general piece into a personal nudge.

Rules:
- 1–2 sentences. ~30 words max. Second person. Plain text, no preamble, no quotes, no emoji.
- Connect the article's point to their actual lane / driver / exposure — be specific to their work, not generic.
- The member's numbers are given facts; use them as-is, never restate a different number or recompute anything.
- End pointing gently forward (read it, bring it to your pod, try the move) — never alarmist.`;

function memberFacts(c: MapComputed, overall: number | null): string {
  const band = exposureBand(overall);
  return JSON.stringify({
    career: c.career ?? null,
    lane: c.lane ?? null,
    exposure: overall,
    band: band.word || bandWord(c.band) || null,
    biggest_factor: c.driver?.name ?? null,
    second_move: c.move?.edge2 ?? null,
  });
}

async function latestMap(userId: string): Promise<{ computed: MapComputed; overall: number | null } | null> {
  const rows = await db
    .select({ computed: mapStates.computed, overall: mapStates.overall })
    .from(mapStates)
    .where(eq(mapStates.memberId, userId))
    .orderBy(desc(mapStates.createdAt))
    .limit(1);
  const r = rows[0];
  if (!r?.computed) return null;
  return { computed: r.computed as MapComputed, overall: typeof r.overall === "number" ? Math.round(r.overall) : null };
}

/**
 * The member's personalised note for an article. Returns null when AI is off,
 * the member hasn't mapped (nothing to personalise), the article is unknown, or
 * generation fails. Cached per (member, article).
 */
export async function getArticleRelevance(userId: string | null, articleSlug: string | null): Promise<string | null> {
  if (!userId || !articleSlug || !aiConfigured()) return null;
  const article = articleRef(articleSlug);
  if (!article) return null;

  const cached = await db
    .select({ note: articleRelevance.note })
    .from(articleRelevance)
    .where(and(eq(articleRelevance.memberId, userId), eq(articleRelevance.articleSlug, articleSlug)))
    .limit(1);
  if (cached[0]?.note) return cached[0].note;

  const map = await latestMap(userId);
  if (!map) return null; // no Map → nothing to personalise

  const note = await complete({
    system: SYSTEM,
    maxTokens: 200,
    messages: [
      {
        role: "user",
        content:
          `THIS WEEK'S ARTICLE:\n"${article.title}" — ${article.description}\n\n` +
          `THE MEMBER'S MAP (given facts):\n${memberFacts(map.computed, map.overall)}\n\n` +
          `Write their one-line "why this matters to you". Plain text only.`,
      },
    ],
  });
  const clean = note?.trim().replace(/^["']|["']$/g, "") ?? "";
  if (!clean) return null;

  try {
    await db.insert(articleRelevance)
      .values({ memberId: userId, articleSlug, note: clean })
      .onConflictDoNothing();
  } catch (err) {
    console.error("[article-relevance] persist failed", String(err));
  }
  return clean;
}
