"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { setWeeklyPrompt } from "@/lib/ritual";

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
