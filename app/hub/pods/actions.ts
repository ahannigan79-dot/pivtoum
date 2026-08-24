"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, posts } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getPodBySlug } from "@/lib/pods";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "pod";
}

/** Founder-only: spin up a new accountability cohort. */
export async function createPod(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const description = String(formData.get("description") ?? "").trim() || null;

  // Ensure a unique slug.
  const base = slugify(name);
  let slug = base;
  for (let i = 2; (await getPodBySlug(slug)) != null; i++) slug = `${base}-${i}`;

  await db.insert(pods).values({ name: name.slice(0, 120), slug, description: description?.slice(0, 500) ?? null });
  revalidatePath("/hub/pods");
}

export async function joinPod(slug: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await db.insert(podMembers).values({ podId: pod.id, memberId: userId }).onConflictDoNothing();
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

export async function leavePod(slug: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await db.delete(podMembers).where(and(eq(podMembers.podId, pod.id), eq(podMembers.memberId, userId)));
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

/** Post into a pod. Only members can post. */
export async function createPodPost(slug: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  const member = await db
    .select({ podId: podMembers.podId })
    .from(podMembers)
    .where(and(eq(podMembers.podId, pod.id), eq(podMembers.memberId, userId)))
    .limit(1);
  if (!member.length) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.insert(posts).values({ authorId: userId, podId: pod.id, body: body.slice(0, 5000) });
  revalidatePath(`/hub/pods/${slug}`);
}
