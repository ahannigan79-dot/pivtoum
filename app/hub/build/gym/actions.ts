"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pickOrCreateRep, memberLane } from "@/lib/gym-generate";
import { getOrCreateProfile, isFounder } from "@/lib/member";

/**
 * Generate a fresh, Claude-written Judgment Gym rep and open it. On-demand
 * generation is FOUNDER-ONLY to keep AI costs controlled — there is no member
 * UI for it; members work the authored catalogue and the monthly rotating live
 * set. This gate is the backstop against a direct call. Best-effort: on any
 * failure we send back to the Gym with a flag rather than erroring out.
 */
export async function generateGymRep(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/hub/build/gym");
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) redirect("/hub/build/gym");

  let lane = String(formData.get("lane") ?? "").trim();
  let career = String(formData.get("career") ?? "").trim();
  if (!lane) {
    const seed = await memberLane(userId);
    if (seed) { lane = seed.lane; career = seed.career; }
  }
  if (!lane) redirect("/hub/build/gym?gen=nolane");

  const id = await pickOrCreateRep(userId, lane, career || lane);
  if (!id) redirect("/hub/build/gym?gen=failed");
  redirect(`/hub/build/gym/g/${id}`);
}
