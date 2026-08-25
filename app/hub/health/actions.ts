"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { setWeeklyPrompt, type PromptArticleInput } from "@/lib/ritual";
import { draftWeeklyBrief, articleRef, type FeaturedArticle } from "@/lib/brief";
import { addHighlight, deleteHighlight } from "@/lib/highlights";

/** Founder: set the community's prompt of the week (optionally highlighting an article). */
export async function setPrompt(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");

  const articleSlug = String(formData.get("articleSlug") ?? "").trim();
  const articleUrl = String(formData.get("articleUrl") ?? "").trim();
  const articleTitle = String(formData.get("articleTitle") ?? "").trim();
  const articleSummary = String(formData.get("articleSummary") ?? "").trim();

  let article: PromptArticleInput = null;
  if (articleUrl && articleTitle) article = { url: articleUrl, title: articleTitle, summary: articleSummary || null };
  else if (articleSlug) article = { slug: articleSlug };

  await setWeeklyPrompt(title, body, article);
  revalidatePath("/hub/health");
  revalidatePath("/hub");
  revalidatePath("/hub/community");
}

export type DraftArticleOut =
  | { kind: "internal"; slug: string; title: string; url: string }
  | { kind: "external"; url: string; title: string; summary: string | null }
  | null;
export type BriefDraft = { title: string; body: string; article: DraftArticleOut };

/** Founder: draft this week's brief with Claude. Optionally centred on a scouted article. */
export async function draftBrief(featured?: FeaturedArticle | null): Promise<BriefDraft | null> {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return null;
  const draft = await draftWeeklyBrief(featured ?? null);
  if (!draft) return null;

  let article: DraftArticleOut = null;
  if (draft.article && "slug" in draft.article) {
    const ref = articleRef(draft.article.slug);
    if (ref) article = { kind: "internal", slug: ref.slug, title: ref.title, url: ref.url };
  } else if (draft.article) {
    article = { kind: "external", url: draft.article.url, title: draft.article.title, summary: draft.article.summary ?? null };
  }
  return { title: draft.title, body: draft.body, article };
}

/** Founder: add a curated looking-glass highlight (shown to non-members). */
export async function createHighlight(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  await addHighlight(
    String(formData.get("title") ?? ""),
    String(formData.get("body") ?? ""),
    String(formData.get("attribution") ?? "") || null,
  );
  revalidatePath("/hub/health");
}

/** Founder: remove a looking-glass highlight. */
export async function removeHighlight(id: string) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  await deleteHighlight(id);
  revalidatePath("/hub/health");
}
