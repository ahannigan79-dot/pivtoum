"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pickOrCreateRebuild } from "@/lib/rebuild-generate";
import { memberLane } from "@/lib/gym-generate";
import { getOrCreateProfile } from "@/lib/member";
import { generateTransformation, storeTransform, latestTransform, daysUntilNext } from "@/lib/workflow-transform";

/**
 * Generate a fresh Workflow Rebuild for the member's lane (optionally a specific
 * workflow they name) and open it. Best-effort: on failure, back to the landing.
 */
export async function generateRebuild(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/hub/build/rebuild");

  let lane = String(formData.get("lane") ?? "").trim();
  let career = String(formData.get("career") ?? "").trim();
  const workflow = String(formData.get("workflow") ?? "").trim();
  if (!lane) {
    const seed = await memberLane(userId);
    if (seed) { lane = seed.lane; career = seed.career; }
  }
  if (!lane) redirect("/hub/build/rebuild?gen=nolane");

  const id = await pickOrCreateRebuild(userId, lane, career || lane, workflow);
  if (!id) redirect("/hub/build/rebuild?gen=failed");
  redirect(`/hub/build/rebuild/g/${id}`);
}

/**
 * Rebuild the member's OWN workflow AI-native → a boss-shareable transformation
 * doc (Claude). Capped to one per member per month (the API cost is real).
 */
export async function transformWorkflow(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/hub/build/rebuild/mine");

  const last = await latestTransform(userId);
  if (last && daysUntilNext(last.createdAt) > 0) redirect("/hub/build/rebuild/mine?err=limit");

  const workflow = String(formData.get("workflow") ?? "").trim().slice(0, 160);
  const steps = String(formData.get("steps") ?? "").trim().slice(0, 2000);
  const roleIn = String(formData.get("role") ?? "").trim().slice(0, 120);
  if (!workflow || !steps) redirect("/hub/build/rebuild/mine?err=input");

  const [profile, seed] = await Promise.all([getOrCreateProfile(), memberLane(userId)]);
  const inputs = {
    workflow, steps,
    role: roleIn || profile?.displayName || "a professional in this field",
    career: seed?.career || profile?.careerSlug || "your field",
    lane: seed?.lane || profile?.currentLane || "your lane",
  };
  const doc = await generateTransformation(inputs);
  if (!doc) redirect("/hub/build/rebuild/mine?err=failed");
  await storeTransform(userId, inputs, doc!);
  redirect("/hub/build/rebuild/mine?ok=1");
}
