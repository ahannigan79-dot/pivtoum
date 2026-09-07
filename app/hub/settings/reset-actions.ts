"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
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
/** The canonical starter pods — one per major field, plain field-name naming so
 *  members always see clear, non-confusing options. Mirrors the ddl seed. */
const FIELD_PODS = [
  { slug: "marketing-brand",       name: "Marketing & Brand",       description: "Marketers, brand and growth people rebuilding the function AI-native." },
  { slug: "software-engineering",  name: "Software & Engineering",  description: "Engineers and builders navigating AI-native development." },
  { slug: "healthcare-nursing",    name: "Healthcare & Nursing",    description: "Clinical and care roles — where judgment and presence still win." },
  { slug: "finance-accounting",    name: "Finance & Accounting",    description: "Finance, accounting and audit pros steering through automation." },
  { slug: "legal-compliance",      name: "Legal & Compliance",      description: "Lawyers, paralegals and compliance staff facing AI head-on." },
  { slug: "design-creative",       name: "Design & Creative",       description: "Designers, writers and creatives deepening what AI can't take." },
  { slug: "data-analytics",        name: "Data & Analytics",        description: "Analysts and data people turning AI into leverage." },
  { slug: "sales-customer",        name: "Sales & Customer",        description: "Sales, success and support — owning the relationships that matter." },
  { slug: "project-management",    name: "Project & Program Management", description: "Project and program leads running delivery AI-native — planning, status and risk." },
  { slug: "consulting-strategy",   name: "Consulting & Strategy",   description: "Consultants and strategy pros — advisory work where judgment is the product." },
  { slug: "people-hr",             name: "People & HR",             description: "HR, recruiting and people teams reshaping how work gets done." },
  { slug: "operations-admin",      name: "Operations & Admin",      description: "Ops, project and admin roles rebuilding the back office." },
  { slug: "education-training",    name: "Education & Training",    description: "Teachers, trainers and L&D adapting to AI in the room." },
  { slug: "students-early-career", name: "Students & Early Career", description: "Just starting out — going AI-native from day one." },
];

/** Old branded/creative demo pods — retired: their names didn't map to a field
 *  and read as confusing next to the vanilla set. Removed on seed. */
const RETIRED_DEMO_SLUGS = [
  "pod-operators", "pod-nightowls", "pod-launchpad", "pod-storyfirst", "pod-critpath",
  "pod-shipit", "pod-frontier", "pod-signal", "pod-firstmovers", "pod-ledger",
  "pod-command", "pod-groundwork",
];

export async function seedStarterPods() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) throw new Error("Founder only");

  // 1) Ensure the canonical field pods exist and are listable.
  for (const d of FIELD_PODS) {
    await db.insert(pods)
      .values({ name: d.name, slug: d.slug, description: d.description, listable: true, capacity: 7 })
      .onConflictDoNothing({ target: pods.slug });
  }
  await db.update(pods).set({ listable: true }).where(inArray(pods.slug, FIELD_PODS.map((d) => d.slug)));

  // 2) Remove the old branded demo pods (cascade drops their demo memberships),
  //    so Browse shows only the clear field-name set.
  await db.delete(pods).where(inArray(pods.slug, RETIRED_DEMO_SLUGS));

  redirect("/hub/pods/place");
}
