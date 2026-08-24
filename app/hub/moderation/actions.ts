"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { resolvePostReports } from "@/lib/moderation";

/** Founder: keep the post, clear its reports. */
export async function dismissReports(postId: string) {
  const { userId } = await auth();
  const profile = await getOrCreateProfile();
  if (!userId || !isFounder(profile)) return;
  await resolvePostReports(postId, userId);
  revalidatePath("/hub/moderation");
}

/** Founder: remove the post (reports cascade away with it). */
export async function removePost(postId: string) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/hub/moderation");
  revalidatePath("/hub/community");
  revalidatePath("/hub/pods", "layout");
}
