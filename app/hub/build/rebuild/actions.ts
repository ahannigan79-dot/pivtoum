"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pickOrCreateRebuild } from "@/lib/rebuild-generate";
import { memberLane } from "@/lib/gym-generate";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { requireMember } from "@/lib/gate";
import {
  generateTransformation, storeTransform, latestTransform, daysUntilNext, assessInput,
  sanitizeTransformation, updateTransformDoc, ensureShareToken, revokeShareToken, type Transformation,
} from "@/lib/workflow-transform";

/**
 * Generate a fresh Workflow Rebuild for the member's lane (optionally a specific
 * workflow they name) and open it. Best-effort: on failure, back to the landing.
 */
export async function generateRebuild(formData: FormData): Promise<void> {
  const userId = await requireMember();
  if (!userId) redirect("/hub/build/rebuild");
  // On-demand lane rebuilds are FOUNDER-ONLY to keep AI costs controlled — no
  // member UI points here; members use the capped 1/month "rebuild my workflow"
  // and the authored catalogue. This gate backstops a direct call.
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) redirect("/hub/build/rebuild");

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
  const userId = await requireMember();
  if (!userId) redirect("/hub/build/rebuild/mine");

  const last = await latestTransform(userId);
  if (last && daysUntilNext(last.createdAt) > 0) redirect("/hub/build/rebuild/mine?err=limit");

  const workflow = String(formData.get("workflow") ?? "").trim().slice(0, 160);
  const steps = String(formData.get("steps") ?? "").trim().slice(0, 2000);
  const roleIn = String(formData.get("role") ?? "").trim().slice(0, 120);
  if (!workflow || !steps) redirect("/hub/build/rebuild/mine?err=input");

  // Hold the input to a real standard before spending the month's generation —
  // the doc is only as good as the description. A gated attempt costs nothing
  // and does NOT use the monthly allowance.
  const verdict = assessInput(workflow, steps);
  if (!verdict.ok) redirect(`/hub/build/rebuild/mine?err=q_${verdict.code}`);

  const [profile, seed] = await Promise.all([getOrCreateProfile(), memberLane(userId)]);
  const inputs = {
    workflow, steps,
    role: roleIn || profile?.displayName || "a professional in this field",
    career: seed?.career || profile?.careerSlug || "your field",
    lane: seed?.lane || profile?.currentLane || "your lane",
  };
  const doc = await generateTransformation(inputs);
  if (!doc) redirect("/hub/build/rebuild/mine?err=failed");
  try {
    await storeTransform(userId, inputs, doc!);
  } catch (e) {
    console.error("storeTransform failed (is the workflow_transforms table migrated?)", e);
    redirect("/hub/build/rebuild/mine?err=failed");
  }
  redirect("/hub/build/rebuild/mine?ok=1");
}

/** Save the member's edits to their own transform doc (ownership-checked). */
export async function saveTransformDoc(id: string, doc: Transformation): Promise<{ ok: boolean }> {
  const userId = await requireMember();
  if (!userId) return { ok: false };
  const clean = sanitizeTransformation(doc);
  if (!clean) return { ok: false };
  const ok = await updateTransformDoc(userId, id, clean);
  if (ok) revalidatePath("/hub/build/rebuild/mine");
  return { ok };
}

/** Turn on sharing and return the public link path (or null). */
export async function shareTransform(id: string): Promise<{ token: string | null }> {
  const userId = await requireMember();
  if (!userId) return { token: null };
  const token = await ensureShareToken(userId, id);
  if (token) revalidatePath("/hub/build/rebuild/mine");
  return { token };
}

/** Turn off sharing — the public link stops resolving. */
export async function unshareTransform(id: string): Promise<void> {
  const userId = await requireMember();
  if (!userId) return;
  await revokeShareToken(userId, id);
  revalidatePath("/hub/build/rebuild/mine");
}
