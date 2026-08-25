import { NextResponse } from "next/server";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { seedGymCatalogue } from "@/lib/gym-seed";

// Founder-only: pre-seed the Gym catalogue with 2 reps per career, one bounded
// batch per call (the client loops until done to stay inside the timeout).
export const maxDuration = 300;

export async function POST() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return new NextResponse("Forbidden", { status: 403 });
  const result = await seedGymCatalogue();
  return NextResponse.json(result);
}
