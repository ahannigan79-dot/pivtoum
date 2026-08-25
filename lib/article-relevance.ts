import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articleRelevance, mapStates } from "@/db/schema";
import { complete, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { exposureBand, bandWord, type MapComputed } from "@/lib/trajectory";
import { latestArticles, type PromptArticle } from "@/lib/brief";

/**
 * "Why this matters to you" — a one-line, per-member reading of the week's
 * highlighted article, tied to the member's own lane and exposure. Turns a
 * broadcast article into a personal nudge. Grounded in the member's computed Map
 * (never recomputes it) and cached per (member, article) so it's generated once.
 */

const SYSTEM = `${VOICE}

## Your task right now
The community highlights one article each week for everyone. Write ONE short, personal note to a specific member.

First, judge honestly: does this week's article genuinely connect to THIS member's lane, driver, and exposure?
- If it DOES: in 1–2 sentences, make that connection specific to their work — why it matters for them, pointing gently forward.
- If it does NOT (it's really about a different field, life stage, or situation): do NOT force a thin or generic connection. Instead, give them the one thing about THEIR own lane worth their attention right now — drawn from their biggest factor and next move — in the same warm voice, so the note still lands. If one of the OTHER listed pieces clearly fits them better, you may name it (by its exact title) and say it's the more relevant read for them.

Rules:
- 1–2 sentences. ~30 words max. Second person. Plain text, no preamble, no quotes, no emoji.
- The member's numbers are given facts; use them as-is, never restate a different number or recompute anything.
- Never alarmist. Always leave them with something specific and useful to THEM — never a forced stretch to make an off-topic article fit.`;

function memberFacts(c: MapComputed, overall: number | null): string {
  const band = exposureBand(overall);
  return JSON.stringify({
    career: c.career ?? null,
    lane: c.lane ?? null,
    exposure: overall,
    band: band.word || bandWord(c.band) || null,
    biggest_factor: c.driver?.name ?? null,
    biggest_factor_why: strip(c.driverDetail?.why) || null,
    next_move_to_try: strip(c.driverDetail?.action) || null,
    second_move: c.move?.edge2 ?? null,
  });
}

const strip = (s: string | undefined | null) => (s ?? "").replace(/<[^>]+>/g, "").trim();

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
export async function getArticleRelevance(userId: string | null, article: PromptArticle | null): Promise<string | null> {
  if (!userId || !article || !aiConfigured()) return null;
  const cacheKey = article.key; // slug for internal, url for external — stable per article

  const cached = await db
    .select({ note: articleRelevance.note })
    .from(articleRelevance)
    .where(and(eq(articleRelevance.memberId, userId), eq(articleRelevance.articleSlug, cacheKey)))
    .limit(1);
  if (cached[0]?.note) return cached[0].note;

  const map = await latestMap(userId);
  if (!map) return null; // no Map → nothing to personalise

  // Other pieces, so the note can redirect when the featured article is off-lane.
  const others = latestArticles(6)
    .filter((a) => a.slug !== article.key && a.title !== article.title)
    .map((a) => `- "${a.title}" — ${a.description}`);

  const note = await complete({
    system: SYSTEM,
    maxTokens: 200,
    messages: [
      {
        role: "user",
        content:
          `THIS WEEK'S ARTICLE:\n"${article.title}"${article.description ? ` — ${article.description}` : ""}\n\n` +
          `THE MEMBER'S MAP (given facts):\n${memberFacts(map.computed, map.overall)}\n\n` +
          (others.length ? `OTHER PIECES AVAILABLE (only name one if it clearly fits them better):\n${others.join("\n")}\n\n` : "") +
          `Write their one-line "why this matters to you" — genuinely useful to them, never a forced fit. Plain text only.`,
      },
    ],
  });
  const clean = note?.trim().replace(/^["']|["']$/g, "") ?? "";
  if (!clean) return null;

  try {
    await db.insert(articleRelevance)
      .values({ memberId: userId, articleSlug: cacheKey, note: clean })
      .onConflictDoNothing();
  } catch (err) {
    console.error("[article-relevance] persist failed", String(err));
  }
  return clean;
}
