"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates, podMembers, podCheckins, commitments, lessonProgress, memberBadges, profiles } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";

/**
 * Founder-only testing helper: wipe the caller's OWN onboarding state so the
 * guided new-member flow (Map → Eva → pod → welcome bot) can be re-run from
 * scratch. Deletes only rows belonging to the current user; never touches
 * anyone else. Not destructive to the account itself (subscription, profile,
 * handle all remain) — just the progress that drives onboarding.
 */
export async function resetToNewUser() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) throw new Error("Founder only");
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");

  await Promise.all([
    db.delete(mapStates).where(eq(mapStates.memberId, userId)),
    db.delete(commitments).where(eq(commitments.memberId, userId)),
    db.delete(lessonProgress).where(eq(lessonProgress.memberId, userId)),
    db.delete(memberBadges).where(eq(memberBadges.memberId, userId)),
    db.delete(podCheckins).where(eq(podCheckins.memberId, userId)),
    db.delete(podMembers).where(eq(podMembers.memberId, userId)),
    db.update(profiles).set({ onboardedAt: null }).where(eq(profiles.clerkUserId, userId)),
  ]);

  redirect("/hub");
}
