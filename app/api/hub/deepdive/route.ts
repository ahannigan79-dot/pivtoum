import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/member";
import { getAccess } from "@/lib/gate";
import { getOrCreateDeepDive } from "@/lib/deepdive";
import { aiConfigured } from "@/lib/ai";

// A member's self-framed career Deep Dive. Generated on first view (grounded in
// the career's scores), then cached and shared. Members-only; fetched client-side
// so the (one-time) generation never blocks the page.
export const maxDuration = 180;

export async function GET(req: Request) {
  const profile = await getOrCreateProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  const access = await getAccess(profile.clerkUserId, profile);
  if (!access.member) return new NextResponse("Members only", { status: 403 });
  if (!aiConfigured()) return NextResponse.json({ doc: null, reason: "ai-off" });

  const slug = new URL(req.url).searchParams.get("slug");
  const result = await getOrCreateDeepDive(slug);
  if (!result) return NextResponse.json({ doc: null });
  return NextResponse.json({ doc: result.doc });
}
