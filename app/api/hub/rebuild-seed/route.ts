import { NextResponse } from "next/server";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { seedRebuildCatalogue, clearRebuildCatalogue } from "@/lib/rebuild-seed";

// Founder-only: pre-seed the Workflow Rebuild catalogue, 2 per career, one
// bounded batch per call (client loops until done to stay inside the timeout).
export const maxDuration = 300;

export async function POST() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return new NextResponse("Forbidden", { status: 403 });
  const result = await seedRebuildCatalogue();
  return NextResponse.json(result);
}

export async function DELETE() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return new NextResponse("Forbidden", { status: 403 });
  const cleared = await clearRebuildCatalogue();
  return NextResponse.json({ cleared });
}
