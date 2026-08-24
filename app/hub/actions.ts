"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

/** Member confirms they've booked their 1:1 welcome — advances the plan. */
export async function markWelcomeBooked() {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(profiles).set({ onboardedAt: new Date() }).where(eq(profiles.clerkUserId, userId));
  revalidatePath("/hub");
}
