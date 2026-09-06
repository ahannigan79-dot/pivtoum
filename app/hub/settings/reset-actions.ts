"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates, podMembers, podCheckins, commitments, lessonProgress, memberBadges, profiles, pods } from "@/db/schema";
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

/**
 * Founder-only testing helper: seed a few listable demo pods (with vibes, crests
 * and lanes matched to the founder's own lane) so the guided placement flow has
 * real cards to show. Idempotent by slug. Demo data only — safe to re-run.
 */
export async function seedDemoPods() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) throw new Error("Founder only");
  const lane = profile?.currentLane ?? "Product marketing";
  const region = profile?.region || "East";
  const other = region === "East" ? "West" : "East";
  const defs = [
    { slug: "demo-operators", name: "The Operators", crest: "⚙️", lane, region,
      vibe: "Mid-career, going AI-native on the day job. We ship one workflow rebuild a week and compare notes. No lurkers." },
    { slug: "demo-nightshift", name: "Night Shift", crest: "🌙", lane, region: other,
      vibe: "Async-first, evenings-and-weekends crowd. A Sunday check-in keeps us honest, and we run a shared streak." },
    { slug: "demo-frontier", name: "Frontier", crest: "🛰️", lane: "Product management", region,
      vibe: "Product & strategy people betting on judgment — a weekly live session on the calls AI can't make for us." },
    { slug: "demo-craft", name: "The Craft", crest: "🎯", lane: "Brand strategy / marketing leadership", region,
      vibe: "Senior operators deepening trust and relationships. Small, high-signal, references shared freely." },
  ];
  for (const d of defs) {
    await db.insert(pods).values({
      name: d.name, slug: d.slug, vibe: d.vibe, crest: d.crest, lane: d.lane, region: d.region,
      capacity: 7, listable: true,
    }).onConflictDoNothing({ target: pods.slug });
  }
  redirect("/hub/pods/place");
}
