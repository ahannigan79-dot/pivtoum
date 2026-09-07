"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { adoptPlayAsFocus, toggleFocusStep, dropFocus } from "@/lib/focus";
import { submitArtifact } from "@/lib/artifacts";

export async function adoptFocus(playSlug: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await adoptPlayAsFocus(userId, playSlug);
  revalidatePath("/hub");
  revalidatePath(`/hub/playbook/${playSlug}`);
}

export async function toggleStep(stepId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await toggleFocusStep(userId, stepId);
  revalidatePath("/hub");
}

export async function dropGoal(goalId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await dropFocus(userId, goalId);
  revalidatePath("/hub");
}

/** Submit the artifact a completed play produced — files to the Library and opens
 *  domain-leader review. Kind is "link" (a URL) or "note" (pasted text). */
export async function submitMoveArtifact(goalId: string, playSlug: string, playTitle: string, formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  const kind = String(formData.get("kind") ?? "link") === "note" ? "note" : "link";
  const url = String(formData.get("url") ?? "").trim().slice(0, 600);
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (kind === "link" && !url) return;
  if (kind === "note" && !body) return;
  await submitArtifact(userId, { goalId, playSlug, playTitle, kind, url: url || undefined, body: body || undefined });
  revalidatePath("/hub");
  revalidatePath("/hub/library");
}
