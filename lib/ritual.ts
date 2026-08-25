import { desc } from "drizzle-orm";
import { db } from "@/db";
import { weeklyPrompts } from "@/db/schema";

export type WeeklyPrompt = {
  id: string;
  title: string;
  body: string;
  articleSlug: string | null;    // internal registry article
  articleUrl: string | null;     // OR external (scouted) article
  articleTitle: string | null;
  articleSummary: string | null;
  createdAt: Date;
};

/** How the brief highlights an article: an internal essay, or an external scouted piece. */
export type PromptArticleInput =
  | { slug: string }
  | { url: string; title: string; summary?: string | null }
  | null
  | undefined;

/** The current community prompt — the most recent one the founder set. */
export async function getCurrentPrompt(): Promise<WeeklyPrompt | null> {
  const r = await db.select().from(weeklyPrompts).orderBy(desc(weeklyPrompts.createdAt)).limit(1);
  const p = r[0];
  if (!p) return null;
  return {
    id: p.id, title: p.title, body: p.body,
    articleSlug: p.articleSlug ?? null,
    articleUrl: p.articleUrl ?? null,
    articleTitle: p.articleTitle ?? null,
    articleSummary: p.articleSummary ?? null,
    createdAt: p.createdAt,
  };
}

/** Founder sets a new prompt of the week (gate the caller). */
export async function setWeeklyPrompt(title: string, body: string, article?: PromptArticleInput): Promise<void> {
  const t = title.trim(), b = body.trim();
  if (!t || !b) return;
  const a = article ?? null;
  const isExternal = a && "url" in a;
  await db.insert(weeklyPrompts).values({
    title: t.slice(0, 160),
    body: b.slice(0, 1000),
    articleSlug: a && "slug" in a ? a.slug || null : null,
    articleUrl: isExternal ? a.url || null : null,
    articleTitle: isExternal ? (a.title || "").slice(0, 300) || null : null,
    articleSummary: isExternal ? (a.summary || "").slice(0, 800) || null : null,
  });
}
