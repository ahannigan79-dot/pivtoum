"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, postAttachments, postReports, posts, reactions } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { TOPIC_BY_SLUG } from "@/lib/feed-topics";
import { uploadPostFiles } from "@/lib/blob";

/** Upload any files in the form and attach them to a post. */
export async function attachFiles(postId: string, formData: FormData) {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return;
  const uploaded = await uploadPostFiles(files);
  if (uploaded.length) {
    await db.insert(postAttachments).values(
      uploaded.map((a) => ({ postId, url: a.url, name: a.name, contentType: a.contentType, kind: a.kind })),
    );
  }
}

function revalidateFeeds() {
  revalidatePath("/hub/community");
  revalidatePath("/hub/pods", "layout");
}

/** Delete a post — author or founder/moderator only. */
export async function deletePost(postId: string) {
  const { userId } = await auth();
  if (!userId) return;
  const rows = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!rows[0]) return;
  const profile = await getOrCreateProfile();
  if (rows[0].authorId !== userId && !isFounder(profile)) return;
  await db.delete(posts).where(eq(posts.id, postId));
  revalidateFeeds();
}

/** Report a post to the founders. */
export async function reportPost(postId: string, reason: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.insert(postReports).values({ postId, reporterId: userId, reason: reason.slice(0, 500) || null });
  revalidateFeeds();
}

export async function createPost(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const title = String(formData.get("title") ?? "").trim().slice(0, 160) || null;
  const rawTopic = String(formData.get("topic") ?? "").trim();
  const topicDef = rawTopic ? TOPIC_BY_SLUG[rawTopic] : undefined;
  // Guard founder-only topics server-side.
  let topic: string | null = topicDef ? topicDef.slug : null;
  if (topicDef?.founderOnly) {
    const profile = await getOrCreateProfile();
    if (!isFounder(profile)) topic = null;
  }

  const inserted = await db.insert(posts).values({ authorId: userId, title, topic, body: body.slice(0, 5000) })
    .returning({ id: posts.id });
  if (inserted[0]) await attachFiles(inserted[0].id, formData);
  revalidatePath("/hub/community");
}

/** Founder/moderator: pin or unpin a post to the top of the feed. */
export async function togglePin(postId: string) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const row = await db.select({ pinned: posts.pinned }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!row[0]) return;
  const next = !row[0].pinned;
  await db.update(posts).set({ pinned: next, pinnedAt: next ? new Date() : null }).where(eq(posts.id, postId));
  revalidatePath("/hub/community");
}

export async function addComment(postId: string, body: string) {
  const { userId } = await auth();
  if (!userId) return;
  const b = body.trim();
  if (!b) return;
  await db.insert(comments).values({ postId, authorId: userId, body: b.slice(0, 3000) });
  revalidatePath("/hub/community");
  revalidatePath("/hub/pods", "layout");
}

const REACTION_SET = new Set(["👍", "❤️", "🔥", "🎉", "💡", "👏"]);

export async function toggleReaction(postId: string, emoji: string = "👍") {
  const { userId } = await auth();
  if (!userId) return;
  const e = REACTION_SET.has(emoji) ? emoji : "👍";
  const where = and(eq(reactions.postId, postId), eq(reactions.memberId, userId), eq(reactions.emoji, e));
  const existing = await db.select().from(reactions).where(where).limit(1);
  if (existing[0]) await db.delete(reactions).where(where);
  else await db.insert(reactions).values({ postId, memberId: userId, emoji: e });
  revalidatePath("/hub/community");
  revalidatePath("/hub/pods", "layout");
}
