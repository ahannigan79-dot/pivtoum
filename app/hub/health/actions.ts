"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { setWeeklyPrompt } from "@/lib/ritual";
import { addHighlight, deleteHighlight } from "@/lib/highlights";

/** Founder: set the community's prompt of the week. */
export async function setPrompt(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  await setWeeklyPrompt(title, body);
  revalidatePath("/hub/health");
  revalidatePath("/hub");
  revalidatePath("/hub/community");
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
