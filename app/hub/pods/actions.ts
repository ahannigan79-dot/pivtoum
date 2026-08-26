"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, posts, podThreads } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getFounderIds, getPodBySlug, setPodLeader } from "@/lib/pods";
import { createThreadIn } from "@/lib/threads";
import { attachFiles } from "@/app/hub/community/actions";
import { awardBadge } from "@/lib/badges";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "pod";
}

/** Keep a founder in a pod as a helper while it has fewer than 2 real members;
 *  drop the auto-added founder(s) once the pod can stand on its own. */
async function syncPodHelper(podId: string) {
  const founders = await getFounderIds();
  const members = await db.select({ memberId: podMembers.memberId }).from(podMembers).where(eq(podMembers.podId, podId));
  const founderSet = new Set(founders);
  const realCount = members.filter((m) => !founderSet.has(m.memberId)).length;

  if (realCount >= 2) {
    await db.delete(podMembers).where(and(eq(podMembers.podId, podId), eq(podMembers.auto, true)));
  } else if (realCount === 1) {
    for (const fid of founders) {
      await db.insert(podMembers).values({ podId, memberId: fid, auto: true }).onConflictDoNothing();
    }
  } else {
    // no real members — don't leave the founder sitting in an empty pod
    await db.delete(podMembers).where(and(eq(podMembers.podId, podId), eq(podMembers.auto, true)));
  }
}

/** Founder appoints or removes a pod leader — the tier that runs check-ins and
 *  hosts the monthly Wins and SME sessions. */
export async function setPodLeaderAction(slug: string, memberId: string, on: boolean) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await setPodLeader(pod.id, memberId, on);
  revalidatePath(`/hub/pods/${slug}`);
}

/** Any member can start a Together Pod when they don't see a good fit. */
export async function createPod(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const description = String(formData.get("description") ?? "").trim() || null;

  // Ensure a unique slug.
  const base = slugify(name);
  let slug = base;
  for (let i = 2; (await getPodBySlug(slug)) != null; i++) slug = `${base}-${i}`;

  const inserted = await db.insert(pods)
    .values({ name: name.slice(0, 120), slug, description: description?.slice(0, 500) ?? null })
    .returning({ id: pods.id });
  const podId = inserted[0]?.id;
  if (podId) {
    await db.insert(podMembers).values({ podId, memberId: userId }).onConflictDoNothing();
    await awardBadge(userId, "cohort");
    await syncPodHelper(podId);
  }
  revalidatePath("/hub");
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

export async function joinPod(slug: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await db.insert(podMembers).values({ podId: pod.id, memberId: userId }).onConflictDoNothing();
  await awardBadge(userId, "cohort");
  await syncPodHelper(pod.id);
  revalidatePath("/hub");
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

export async function leavePod(slug: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await db.delete(podMembers).where(and(eq(podMembers.podId, pod.id), eq(podMembers.memberId, userId)));
  await syncPodHelper(pod.id);
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

/** Post into a pod thread. Only members can post. */
export async function createPodPost(slug: string, threadId: string | null, formData: FormData) {
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

  // Validate the thread belongs to this pod.
  let validThread: string | null = null;
  if (threadId) {
    const th = await db.select({ id: podThreads.id }).from(podThreads)
      .where(and(eq(podThreads.id, threadId), eq(podThreads.podId, pod.id))).limit(1);
    if (th.length) validThread = threadId;
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const inserted = await db.insert(posts)
    .values({ authorId: userId, podId: pod.id, threadId: validThread, body: body.slice(0, 5000) })
    .returning({ id: posts.id });
  if (inserted[0]) await attachFiles(inserted[0].id, formData);
  revalidatePath(`/hub/pods/${slug}`);
}

/** Set the pod's pinned goal. Pod members only. */
export async function setPodGoal(slug: string, goal: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  const member = await db.select({ podId: podMembers.podId }).from(podMembers)
    .where(and(eq(podMembers.podId, pod.id), eq(podMembers.memberId, userId))).limit(1);
  if (!member.length) return;
  await db.update(pods).set({ goal: goal.trim().slice(0, 280) || null }).where(eq(pods.id, pod.id));
  revalidatePath(`/hub/pods/${slug}`);
}

/** Create a new thread in a pod. Members only. */
export async function createThread(slug: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  const member = await db.select({ podId: podMembers.podId }).from(podMembers)
    .where(and(eq(podMembers.podId, pod.id), eq(podMembers.memberId, userId))).limit(1);
  if (!member.length) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  const thread = await createThreadIn(pod.id, name, emoji);
  revalidatePath(`/hub/pods/${slug}`);
  if (thread) redirect(`/hub/pods/${slug}?t=${thread.slug}`);
}
