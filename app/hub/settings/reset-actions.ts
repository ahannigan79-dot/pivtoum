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
export async function seedStarterPods() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) throw new Error("Founder only");
  const myLane = profile?.currentLane ?? "Product marketing";
  const myRegion = profile?.region || "East";
  const other = myRegion === "East" ? "West" : "East";

  // A curated, exciting starter set. The goal: every member lands on real,
  // relevant options from day one. We cover the founder's own lane strongly,
  // then spread deliberately — and, crucially, seed BOTH neighbours of a
  // cross-functional role (e.g. a PM in Product Marketing should see Product
  // Marketing pods AND Project Management pods), across both regions.
  // Idempotent by slug — safe to re-run.
  const defs = [
    // — Founder's own lane (guided placement matches strongly) —
    { slug: "pod-operators",  name: "The Operators",  crest: "⚙️", lane: myLane, region: myRegion, strategy: "grow",
      vibe: "We go AI-native on the actual day job. One workflow rebuilt every week, shared with the pod. Show your work, steal freely, ship fast." },
    { slug: "pod-nightowls",  name: "Night Owls",     crest: "🌙", lane: myLane, region: other, strategy: "all",
      vibe: "Async-first, evenings-and-weekends crew. A Sunday check-in keeps us honest and we run a shared streak — miss it and you owe the pod a rebuild." },
    // — Product Marketing —
    { slug: "pod-launchpad",  name: "Launchpad",      crest: "🎯", lane: "Product marketing", region: myRegion, strategy: "grow",
      vibe: "Product marketers turning positioning, launches and messaging AI-native. We ship a narrative a week and pressure-test it on each other before the market does." },
    { slug: "pod-storyfirst", name: "Story First",    crest: "✍️", lane: "Product marketing", region: other, strategy: "defend",
      vibe: "The craft AI can't fake: sharp positioning and a story that lands. We use the tools for the grind and keep the judgment for ourselves." },
    // — Project / Program Management —
    { slug: "pod-critpath",   name: "Critical Path",  crest: "🗺️", lane: "Project management", region: myRegion, strategy: "grow",
      vibe: "PMs and program leads running delivery AI-native — status, risk, planning automated so we spend our hours on the calls only a human can make." },
    { slug: "pod-shipit",     name: "Ship It",        crest: "📦", lane: "Project management", region: other, strategy: "defend",
      vibe: "Delivery people who move. We trade the AI plays that kill status-update busywork and protect the stakeholder trust that keeps us in the room." },
    // — Product management (strategy) —
    { slug: "pod-frontier",   name: "Frontier",       crest: "🛰️", lane: "Product management", region: myRegion, strategy: "defend",
      vibe: "Product and strategy people betting everything on judgment. Weekly live room on the calls AI can't make for us — bring a real decision." },
    // — Marketing science / analytics —
    { slug: "pod-signal",     name: "Signal",         crest: "📡", lane: "Marketing science / analytics", region: myRegion, strategy: "pivot",
      vibe: "Data and analytics people staying ahead of the tools that automate the reporting. We move up the stack — to the questions, not the queries." },
    // — Entrants / career-launchers —
    { slug: "pod-firstmovers",name: "First Movers",   crest: "🚀", lane: "Entry data analyst", region: myRegion, strategy: "grow",
      vibe: "New grads and career-launchers going AI-native from day one, no old habits to unlearn. We land first roles together and trade every interview lesson." },
    // — Finance —
    { slug: "pod-ledger",     name: "The Ledger",     crest: "📊", lane: "Audit / CPA advisory", region: other, strategy: "defend",
      vibe: "Accounting and finance operators turning close, audit and advisory AI-native — and moving our hours to the judgment clients actually pay for." },
    // — Leadership / P&L —
    { slug: "pod-command",    name: "Command",        crest: "🧭", lane: "General management / P&L ownership", region: myRegion, strategy: "grow",
      vibe: "Leaders reshaping how the whole function works, not just doing the work. We own the AI transformation instead of waiting for it." },
    // — Hands-on / protected ground —
    { slug: "pod-groundwork", name: "Groundwork",     crest: "🏗️", lane: "Construction project manager", region: other, strategy: "pivot",
      vibe: "On-site and hands-on — the protected ground AI can't reach. We sharpen the judgment and trust that keep us there, and get it seen." },
  ];
  for (const d of defs) {
    await db.insert(pods).values({
      name: d.name, slug: d.slug, vibe: d.vibe, crest: d.crest, lane: d.lane, region: d.region,
      strategy: d.strategy, capacity: 7, listable: true,
    }).onConflictDoNothing({ target: pods.slug });
  }
  redirect("/hub/pods/place");
}
