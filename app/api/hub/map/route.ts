import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates, profiles } from "@/db/schema";
import { awardBadge } from "@/lib/badges";

// Save a computed Map for the signed-in member (one snapshot per completion → the
// Evolve trajectory). Also stamps the member's current career/lane on their profile.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.answers || !body?.computed) return new NextResponse("Bad request", { status: 400 });

  const overall = typeof body.overall === "number" ? body.overall : null;

  await db.insert(mapStates).values({
    memberId: userId,
    answers: body.answers,
    computed: body.computed,
    overall,
  });

  // Keep the profile's career/lane current so the rest of the hub knows where they stand.
  const careerSlug = body.answers?.careerSlug ?? null;
  const currentLane = body.answers?.lane ?? null;
  if (careerSlug || currentLane) {
    await db.update(profiles).set({ careerSlug, currentLane }).where(eq(profiles.clerkUserId, userId));
  }

  await awardBadge(userId, "mapped");

  return NextResponse.json({ ok: true });
}

// Latest saved Map, for the dashboard.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const rows = await db
    .select()
    .from(mapStates)
    .where(eq(mapStates.memberId, userId))
    .orderBy(desc(mapStates.createdAt))
    .limit(1);
  return NextResponse.json(rows[0] ?? null);
}
