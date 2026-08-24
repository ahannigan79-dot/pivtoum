"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts, reactions } from "@/db/schema";

export async function createPost(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.insert(posts).values({ authorId: userId, body: body.slice(0, 5000) });
  revalidatePath("/hub/community");
}

export async function addComment(postId: string, body: string) {
  const { userId } = await auth();
  if (!userId) return;
  const b = body.trim();
  if (!b) return;
  await db.insert(comments).values({ postId, authorId: userId, body: b.slice(0, 3000) });
  revalidatePath("/hub/community");
}

export async function toggleReaction(postId: string) {
  const { userId } = await auth();
  if (!userId) return;
  const where = and(eq(reactions.postId, postId), eq(reactions.memberId, userId), eq(reactions.emoji, "👍"));
  const existing = await db.select().from(reactions).where(where).limit(1);
  if (existing[0]) await db.delete(reactions).where(where);
  else await db.insert(reactions).values({ postId, memberId: userId, emoji: "👍" });
  revalidatePath("/hub/community");
}
