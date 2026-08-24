"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { commitments, lessonProgress, profiles } from "@/db/schema";
import { LEVER_BY_SLUG } from "@/lib/moves";
import { awardBadge } from "@/lib/badges";

/** Member confirms they've booked their 1:1 welcome — advances the plan. */
export async function markWelcomeBooked() {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(profiles).set({ onboardedAt: new Date() }).where(eq(profiles.clerkUserId, userId));
  await awardBadge(userId, "welcomed");
  revalidatePath("/hub");
}

/** Log a completed Build rep (self-attested from the tool page). Ticks the plan + Operator badge. */
export async function logBuildRep(key: string) {
  const { userId } = await auth();
  if (!userId) return;
  const lessonKey = key.startsWith("build:") ? key : `build:${key}`;
  await db.insert(lessonProgress)
    .values({ memberId: userId, lessonKey, status: "complete" })
    .onConflictDoUpdate({
      target: [lessonProgress.memberId, lessonProgress.lessonKey],
      set: { status: "complete", updatedAt: new Date() },
    });
  await awardBadge(userId, "operator");
  revalidatePath("/hub");
  revalidatePath("/hub/build");
}

/** Mark the Learn space started on first genuine visit. */
export async function markLearnStarted() {
  const { userId } = await auth();
  if (!userId) return;
  await db.insert(lessonProgress)
    .values({ memberId: userId, lessonKey: "learn:levers", status: "started" })
    .onConflictDoNothing();
  revalidatePath("/hub");
}

/** Commit to a move against a lever. */
export async function createMove(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const title = String(formData.get("title") ?? "").trim();
  const lever = String(formData.get("lever") ?? "").trim();
  if (!title || !LEVER_BY_SLUG[lever]) return;
  const dueRaw = String(formData.get("dueAt") ?? "").trim();
  const dueAt = dueRaw ? new Date(dueRaw) : null;
  await db.insert(commitments).values({ memberId: userId, lever, title: title.slice(0, 240), dueAt });
  await awardBadge(userId, "committed");
  revalidatePath("/hub");
}

/** Accept a Map-seeded suggestion straight into a commitment. */
export async function acceptSuggestion(title: string, lever: string) {
  const { userId } = await auth();
  if (!userId) return;
  if (!title.trim() || !LEVER_BY_SLUG[lever]) return;
  await db.insert(commitments).values({ memberId: userId, lever, title: title.slice(0, 240) });
  await awardBadge(userId, "committed");
  revalidatePath("/hub");
}

export async function shipMove(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(commitments).set({ status: "done", completedAt: new Date() })
    .where(and(eq(commitments.id, id), eq(commitments.memberId, userId)));
  await awardBadge(userId, "shipped");
  revalidatePath("/hub");
}

export async function dropMove(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(commitments).set({ status: "dropped" })
    .where(and(eq(commitments.id, id), eq(commitments.memberId, userId)));
  revalidatePath("/hub");
}
