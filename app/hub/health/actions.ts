"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { setWeeklyPrompt } from "@/lib/ritual";
import { draftWeeklyBrief, articleRef } from "@/lib/brief";
import { addHighlight, deleteHighlight } from "@/lib/highlights";

/** Founder: set the community's prompt of the week (optionally highlighting an article). */
export async function setPrompt(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const articleSlug = String(formData.get("articleSlug") ?? "") || null;
  await setWeeklyPrompt(title, body, articleSlug);
  revalidatePath("/hub/health");
  revalidatePath("/hub");
  revalidatePath("/hub/community");
}

export type BriefDraft = { title: string; body: string; articleSlug: string | null; articleTitle: string | null };

/** Founder: draft this week's brief with Claude (grounded in the latest article + activity). */
export async function draftBrief(): Promise<BriefDraft | null> {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return null;
  const draft = await draftWeeklyBrief();
  if (!draft) return null;
  return { ...draft, articleTitle: articleRef(draft.articleSlug)?.title ?? null };
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
