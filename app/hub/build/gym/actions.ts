"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createGeneratedRep, memberLane } from "@/lib/gym-generate";

/**
 * Generate a fresh, Claude-written Judgment Gym rep and open it. Seeded by the
 * member's own Map lane when the form doesn't name one. Best-effort: on any
 * failure we send them back to the Gym with a flag rather than erroring out.
 */
export async function generateGymRep(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/hub/build/gym");

  let lane = String(formData.get("lane") ?? "").trim();
  let career = String(formData.get("career") ?? "").trim();
  if (!lane) {
    const seed = await memberLane(userId);
    if (seed) { lane = seed.lane; career = seed.career; }
  }
  if (!lane) redirect("/hub/build/gym?gen=nolane");

  const id = await createGeneratedRep(userId, lane, career || lane);
  if (!id) redirect("/hub/build/gym?gen=failed");
  redirect(`/hub/build/gym/g/${id}`);
}
