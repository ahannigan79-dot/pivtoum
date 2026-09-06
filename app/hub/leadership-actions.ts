"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { expressInterest, resolveInterest } from "@/lib/leadership";

export async function expressLeadershipInterest(role: "captain" | "domain", domain: string | null, note: string | null) {
  const { userId } = await auth();
  if (!userId) return;
  await expressInterest(userId, role, domain, note);
  revalidatePath("/hub/welcome");
  revalidatePath("/hub");
}

export async function resolveLeadershipInterest(id: string, approve: boolean) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  await resolveInterest(id, approve);
  revalidatePath("/hub/leadership");
}
