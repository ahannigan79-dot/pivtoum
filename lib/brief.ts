import "server-only";
import { completeJSON, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";
import { articles, getArticle, type ArticleMeta } from "@/content/articles/registry";
import { getHealthReport } from "@/lib/health";

/**
 * The weekly brief — the community heartbeat prompt the founder posts each week.
 * Claude drafts it grounded in (a) the latest article's finding and (b) what's
 * actually landing in the community, then turns that into a discussion prompt
 * members post about. The founder edits before it goes live — this is a first
 * draft, never an auto-post.
 */

export type ArticleRef = { slug: string; title: string; description: string; date: string; url: string };

/** Newest-first article references for the hub (the registry is authored newest-first). */
export function latestArticles(n = 3): ArticleRef[] {
  return [...articles]
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .slice(0, n)
    .map(toRef);
}

export function articleRef(slug: string | null | undefined): ArticleRef | null {
  if (!slug) return null;
  const a = getArticle(slug);
  return a ? toRef(a) : null;
}

function toRef(a: ArticleMeta): ArticleRef {
  return { slug: a.slug, title: a.title, description: a.description, date: a.datePublished, url: `/articles/${a.slug}` };
}

const SYSTEM = `${VOICE}

## What you are drafting
The community's weekly brief — the single prompt the founder posts to "Winning in the Age of AI" each week. It is the heartbeat: it gives members one thing to reflect on and post about, and it ties the community's public thinking (an article) to a concrete conversation inside.

A good weekly brief:
- Leads by highlighting what the featured article actually shows — the finding, in one or two crisp lines, in Adam's voice.
- Turns that into ONE specific, answerable prompt: something a member can post about from their own work this week. Not abstract ("what do you think about AI?") — concrete ("the one task you finally handed to AI, and what you checked before trusting it").
- Where it fits, nods to what's already landing in the community so it feels alive, not broadcast.
- Is short. Title ≤ 90 characters. Body 2–4 sentences. No hashtags, no emoji, no "Hey everyone".

## Output — STRICT
Return ONLY a JSON object with exactly:
{
  "title": "the prompt title — a sharp, specific line",
  "body": "2–4 sentences: highlight the article's point, then the ask",
  "articleSlug": "the slug of the article you highlighted (from the ones provided), or null"
}`;

type Draft = { title: string; body: string; articleSlug: string | null };

/** Founder-only: draft this week's brief. Returns null if AI is off or output is unusable. */
export async function draftWeeklyBrief(): Promise<Draft | null> {
  if (!aiConfigured()) return null;

  const arts = latestArticles(3);
  if (!arts.length) return null;

  // A light read of what's resonating — so the prompt connects to real activity.
  let landing: string[] = [];
  try {
    const report = await getHealthReport();
    landing = report.landing.slice(0, 4).map((p) => `- ${p.snippet} (${p.podName}, ❤${p.reactions} 💬${p.comments})`);
  } catch {
    /* activity is optional context */
  }

  const context = [
    "RECENT ARTICLES (newest first) — pick the most timely to feature:",
    ...arts.map((a) => `• [${a.slug}] "${a.title}" — ${a.description}`),
    "",
    landing.length ? "WHAT'S LANDING IN THE COMMUNITY (last 30 days):" : "The community is quiet this week — write something that invites the first posts.",
    ...landing,
  ].join("\n");

  const draft = await completeJSON<Draft>({
    system: SYSTEM,
    maxTokens: 700,
    messages: [{ role: "user", content: `Draft this week's brief.\n\n${context}\n\nReturn only the JSON object.` }],
  });
  if (!draft || !draft.title?.trim() || !draft.body?.trim()) return null;

  const slug = draft.articleSlug && arts.some((a) => a.slug === draft.articleSlug) ? draft.articleSlug : null;
  return { title: draft.title.trim(), body: draft.body.trim(), articleSlug: slug };
}
