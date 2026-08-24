"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, posts } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/member";
import { getFounderIds, getPodBySlug } from "@/lib/pods";
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
