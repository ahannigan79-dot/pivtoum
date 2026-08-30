"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, posts, podThreads, profiles } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getPodBySlug, setPodLeader, leadsPod, syncPodHelper, joinMemberToPod, podRoom } from "@/lib/pods";
import { autoPlaceMember } from "@/lib/pod-match";
import { createThreadIn } from "@/lib/threads";
import { attachFiles } from "@/app/hub/community/actions";
import { awardBadge } from "@/lib/badges";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "pod";
}

/** A pod is listable in guided placement only once it has a vibe profile AND a
 *  captain — no unlabeled empty rooms in the shortlist. Recompute after either
 *  the profile or the captaincy changes. */
async function recomputeListable(podId: string) {
  const row = await db.select({ vibe: pods.vibe }).from(pods).where(eq(pods.id, podId)).limit(1);
  const hasVibe = !!row[0]?.vibe?.trim();
  const captain = await db.select({ m: podMembers.memberId }).from(podMembers)
    .where(sql`${podMembers.podId} = ${podId} and ${podMembers.leader} = true`).limit(1);
  await db.update(pods).set({ listable: hasVibe && captain.length > 0 }).where(eq(pods.id, podId));
}

/** Founder appoints or removes a pod captain (Phase 1: reuses pod_members.leader)
 *  — the tier that runs check-ins and hosts the monthly Wins and SME sessions. */
export async function setPodLeaderAction(slug: string, memberId: string, on: boolean) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  await setPodLeader(pod.id, memberId, on);
  if (on) await awardBadge(memberId, "captain");
  await recomputeListable(pod.id);
  revalidatePath(`/hub/pods/${slug}`);
}

/** The captain writes the pod's identity: its vibe, crest, lane and US region.
 *  These drive guided placement (§C) and the pod's pride. Captain or founder. */
export async function setPodProfile(slug: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  const profile = await getOrCreateProfile();
  const allowed = isFounder(profile) || (await leadsPod(userId, pod.id));
  if (!allowed) return;
  const vibe = String(formData.get("vibe") ?? "").trim().slice(0, 400) || null;
  const crest = String(formData.get("crest") ?? "").trim().slice(0, 8) || null;
  const lane = String(formData.get("lane") ?? "").trim().slice(0, 60) || null;
  const region = String(formData.get("region") ?? "").trim().slice(0, 40) || null;
  await db.update(pods).set({ vibe, crest, lane, region }).where(eq(pods.id, pod.id));
  await recomputeListable(pod.id);
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
  if (podId) await joinMemberToPod(userId, podId);
  revalidatePath("/hub");
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

export async function joinPod(slug: string) {
  const { userId } = await auth();
  if (!userId) return;
  const pod = await getPodBySlug(slug);
  if (!pod) return;
  const room = await podRoom(pod.id);
  if (!room.hasRoom) return; // pod is full (cap 7) — placement reroutes elsewhere
  await joinMemberToPod(userId, pod.id);
  revalidatePath("/hub");
  revalidatePath("/hub/pods");
  revalidatePath(`/hub/pods/${slug}`);
}

/** Guided placement: persist the member's pod-intro + region, then join the pod
 *  they chose (capacity-checked) — or auto-place into their best fit. Never solo. */
export async function placeMember(slug: string | null, podIntro?: string | null, region?: string | null) {
  const { userId } = await auth();
  if (!userId) return;

  const patch: { podIntro?: string | null; region?: string } = {};
  if (typeof podIntro === "string") patch.podIntro = podIntro.trim().slice(0, 240) || null;
  if (region === "East" || region === "West") patch.region = region;
  if (Object.keys(patch).length) await db.update(profiles).set(patch).where(eq(profiles.clerkUserId, userId));

  let joined: string | null = null;
  if (slug) {
    const pod = await getPodBySlug(slug);
    if (pod && (await podRoom(pod.id)).hasRoom) {
      await joinMemberToPod(userId, pod.id);
      joined = pod.slug;
    }
  }
  if (!joined) joined = await autoPlaceMember(userId); // chosen pod full, or "just place me"

  revalidatePath("/hub");
  revalidatePath("/hub/pods");
  redirect(joined ? `/hub/pods/${joined}` : "/hub/pods/browse");
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
