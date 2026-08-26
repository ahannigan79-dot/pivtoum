"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { approveSubmission, declineSubmission } from "@/lib/submissions";

export async function approve(id: string) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile) || !profile) return;
  await approveSubmission(id, profile.clerkUserId);
  revalidatePath("/hub/submissions");
  revalidatePath("/hub/events");
  revalidatePath("/hub/community");
}

export async function decline(id: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile) || !profile) return;
  const note = String(formData.get("note") ?? "").trim();
  await declineSubmission(id, profile.clerkUserId, note || undefined);
  revalidatePath("/hub/submissions");
}
