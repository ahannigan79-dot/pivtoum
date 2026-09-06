"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { adoptPlayAsFocus, toggleFocusStep, dropFocus } from "@/lib/focus";

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
