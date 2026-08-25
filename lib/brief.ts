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

/** A resolved highlighted article — internal essay or external scouted piece. */
export type PromptArticle = { key: string; title: string; description: string; url: string; external: boolean };

/** Resolve the article a weekly prompt highlights (internal slug, else external url+title). */
export function resolvePromptArticle(p: {
  articleSlug?: string | null; articleUrl?: string | null; articleTitle?: string | null; articleSummary?: string | null;
} | null | undefined): PromptArticle | null {
  if (!p) return null;
  if (p.articleSlug) {
    const a = articleRef(p.articleSlug);
    if (a) return { key: a.slug, title: a.title, description: a.description, url: a.url, external: false };
  }
  if (p.articleUrl && p.articleTitle) {
    return { key: p.articleUrl, title: p.articleTitle, description: p.articleSummary ?? "", url: p.articleUrl, external: true };
  }
  return null;
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

type RawDraft = { title: string; body: string; articleSlug: string | null };

/** A drafted article highlight: an internal essay (slug) or an external scouted piece. */
export type DraftArticle = { slug: string } | { url: string; title: string; summary?: string | null };
export type BriefDraft = { title: string; body: string; article: DraftArticle | null };

/** A scouted article the founder chose to build the brief around. */
export type FeaturedArticle = { url: string; title: string; summary?: string | null; source?: string | null };

/** Shared: what's landing in the community, as prompt context. */
async function landingContext(): Promise<string[]> {
  try {
    const report = await getHealthReport();
    return report.landing.slice(0, 4).map((p) => `- ${p.snippet} (${p.podName}, ❤${p.reactions} 💬${p.comments})`);
  } catch {
    return [];
  }
}

/**
 * Founder-only: draft this week's brief. With `featured` (a scouted article), the
 * brief is built around THAT piece; otherwise Claude picks the most timely of our
 * own recent essays. Returns null if AI is off or output is unusable.
 */
export async function draftWeeklyBrief(featured?: FeaturedArticle | null): Promise<BriefDraft | null> {
  if (!aiConfigured()) return null;
  const landing = await landingContext();
  const landingBlock = landing.length
    ? ["WHAT'S LANDING IN THE COMMUNITY (last 30 days):", ...landing]
    : ["The community is quiet this week — write something that invites the first posts."];

  // Case 1 — build around a specific scouted article.
  if (featured?.url && featured.title) {
    const context = [
      "FEATURE THIS ARTICLE (it is chosen — highlight it, do not pick another):",
      `"${featured.title}"${featured.source ? ` — ${featured.source}` : ""}`,
      featured.summary ? `Summary: ${featured.summary}` : "",
      "",
      ...landingBlock,
    ].filter(Boolean).join("\n");
    const draft = await completeJSON<RawDraft>({
      system: SYSTEM,
      maxTokens: 700,
      messages: [{ role: "user", content: `Draft this week's brief around the featured article.\n\n${context}\n\nSet articleSlug to null. Return only the JSON object.` }],
    });
    if (!draft?.title?.trim() || !draft?.body?.trim()) return null;
    return {
      title: draft.title.trim(),
      body: draft.body.trim(),
      article: { url: featured.url, title: featured.title, summary: featured.summary ?? null },
    };
  }

  // Case 2 — pick the most timely of our own essays.
  const arts = latestArticles(3);
  if (!arts.length) return null;
  const context = [
    "RECENT ARTICLES (newest first) — pick the most timely to feature:",
    ...arts.map((a) => `• [${a.slug}] "${a.title}" — ${a.description}`),
    "",
    ...landingBlock,
  ].join("\n");
  const draft = await completeJSON<RawDraft>({
    system: SYSTEM,
    maxTokens: 700,
    messages: [{ role: "user", content: `Draft this week's brief.\n\n${context}\n\nReturn only the JSON object.` }],
  });
  if (!draft?.title?.trim() || !draft?.body?.trim()) return null;
  const slug = draft.articleSlug && arts.some((a) => a.slug === draft.articleSlug) ? draft.articleSlug : null;
  return { title: draft.title.trim(), body: draft.body.trim(), article: slug ? { slug } : null };
}
