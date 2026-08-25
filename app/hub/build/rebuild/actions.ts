"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createGeneratedRebuild } from "@/lib/rebuild-generate";
import { memberLane } from "@/lib/gym-generate";

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

  const id = await createGeneratedRebuild(userId, lane, career || lane, workflow);
  if (!id) redirect("/hub/build/rebuild?gen=failed");
  redirect(`/hub/build/rebuild/g/${id}`);
}
