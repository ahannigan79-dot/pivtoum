"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { setLaneBaseline, membersInLane } from "@/lib/baselines";
import { notifyRescore } from "@/lib/notifications";

const clamp = (n: number) => Math.max(3, Math.min(97, Math.round(n)));

/** Founder: re-score a lane's market baseline. Every member in the lane moves
 *  with it (their earned improvement carries), and each gets a heads-up. */
export async function setLaneAction(formData: FormData): Promise<void> {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;

  const careerSlug = String(formData.get("careerSlug") || "").trim();
  const lane = String(formData.get("lane") || "").trim();
  if (!careerSlug || !lane) return;

  const observedRaw = String(formData.get("observed") || "").trim();
  const observed = observedRaw === "" || Number.isNaN(Number(observedRaw)) ? null : clamp(Number(observedRaw));
  const clearing = !!formData.get("clear");
  const raw = String(formData.get("baseline") || "").trim();
  const note = String(formData.get("note") || "").trim() || null;

  let next: number | null;
  if (clearing) next = null;
  else if (raw === "" || Number.isNaN(Number(raw))) return; // nothing to set
  else next = clamp(Number(raw));

  const { previous } = await setLaneBaseline(careerSlug, lane, next, note, profile!.clerkUserId);

  // What members were effectively sitting at, and where they land now.
  const from = previous ?? observed;
  const to = next ?? observed; // clearing reverts them to the observed baseline
  if (from != null && to != null && from !== to) {
    const members = await membersInLane(careerSlug, lane);
    await Promise.all(members.map((m) => notifyRescore(m, { lane, from, to, note })));
  }

  revalidatePath("/hub/market");
  revalidatePath("/hub");
}
