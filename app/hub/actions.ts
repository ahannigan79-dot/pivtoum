"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { commitments, profiles } from "@/db/schema";
import { LEVER_BY_SLUG } from "@/lib/moves";

/** Member confirms they've booked their 1:1 welcome — advances the plan. */
export async function markWelcomeBooked() {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(profiles).set({ onboardedAt: new Date() }).where(eq(profiles.clerkUserId, userId));
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
  revalidatePath("/hub");
}

/** Accept a Map-seeded suggestion straight into a commitment. */
export async function acceptSuggestion(title: string, lever: string) {
  const { userId } = await auth();
  if (!userId) return;
  if (!title.trim() || !LEVER_BY_SLUG[lever]) return;
  await db.insert(commitments).values({ memberId: userId, lever, title: title.slice(0, 240) });
  revalidatePath("/hub");
}

export async function shipMove(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(commitments).set({ status: "done", completedAt: new Date() })
    .where(and(eq(commitments.id, id), eq(commitments.memberId, userId)));
  revalidatePath("/hub");
}

export async function dropMove(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(commitments).set({ status: "dropped" })
    .where(and(eq(commitments.id, id), eq(commitments.memberId, userId)));
  revalidatePath("/hub");
}
