import { asc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { podMembers, pods, profiles } from "@/db/schema";

/** Clerk ids of founders/moderators (role in DB or FOUNDER_EMAILS allowlist). */
export async function getFounderIds(): Promise<string[]> {
  const emails = (process.env.FOUNDER_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  const conds = [eq(profiles.role, "founder"), eq(profiles.role, "moderator")];
  if (emails.length) conds.push(inArray(sql`lower(${profiles.email})`, emails));
  const rows = await db.select({ id: profiles.clerkUserId }).from(profiles).where(or(...conds));
  return rows.map((r) => r.id);
}

export type Pod = typeof pods.$inferSelect;
export type PodMember = { id: string; name: string; avatarUrl: string | null; handle: string | null; leader: boolean };
export type PodSummary = Pod & { memberCount: number; iAmIn: boolean };

function memberView(a: typeof profiles.$inferSelect, leader = false): PodMember {
  return { id: a.clerkUserId, name: a.displayName ?? a.email.split("@")[0], avatarUrl: a.avatarUrl, handle: a.handle, leader };
}

/** True if the member leads any pod — the gate for hosting check-ins, Wins & SME sessions. */
export async function isPodLeader(meId: string | null | undefined): Promise<boolean> {
  if (!meId) return false;
  const r = await db.select({ podId: podMembers.podId }).from(podMembers)
    .where(sql`${podMembers.memberId} = ${meId} and ${podMembers.leader} = true`).limit(1);
  return r.length > 0;
}

/** Appoint or remove a pod leader. Founder-gated at the action layer. */
export async function setPodLeader(podId: string, memberId: string, on: boolean): Promise<void> {
  await db.update(podMembers).set({ leader: on })
    .where(sql`${podMembers.podId} = ${podId} and ${podMembers.memberId} = ${memberId}`);
}

/** True if the member leads this specific pod — the gate for hosting its sessions. */
export async function leadsPod(meId: string | null | undefined, podId: string): Promise<boolean> {
  if (!meId) return false;
  const r = await db.select({ podId: podMembers.podId }).from(podMembers)
    .where(sql`${podMembers.memberId} = ${meId} and ${podMembers.podId} = ${podId} and ${podMembers.leader} = true`).limit(1);
  return r.length > 0;
}

/** Pods the member leads — to populate their "Host a session" picker. */
export async function getMyLedPods(meId: string | null): Promise<Pod[]> {
  if (!meId) return [];
  const rows = await db.select({ p: pods }).from(podMembers)
    .innerJoin(pods, eq(podMembers.podId, pods.id))
    .where(sql`${podMembers.memberId} = ${meId} and ${podMembers.leader} = true`)
    .orderBy(asc(pods.name));
  return rows.map((r) => r.p);
}

/** Pods the member belongs to. */
export async function getMyPods(meId: string | null): Promise<Pod[]> {
  if (!meId) return [];
  const rows = await db
    .select({ p: pods })
    .from(podMembers)
    .innerJoin(pods, eq(podMembers.podId, pods.id))
    .where(eq(podMembers.memberId, meId))
    .orderBy(asc(pods.name));
  return rows.map((r) => r.p);
}

/** Every pod, with member counts and whether the caller is in each. For browsing/joining. */
export async function getBrowsablePods(meId: string | null): Promise<PodSummary[]> {
  const countRows = await db
    .select({ podId: podMembers.podId, n: sql<number>`count(*)::int` })
    .from(podMembers)
    .groupBy(podMembers.podId);
  const counts = new Map(countRows.map((r) => [r.podId, r.n]));

  let mine = new Set<string>();
  if (meId) {
    const mineRows = await db.select({ podId: podMembers.podId }).from(podMembers).where(eq(podMembers.memberId, meId));
    mine = new Set(mineRows.map((r) => r.podId));
  }

  const all = await db.select().from(pods).orderBy(asc(pods.name));
  return all.map((p) => ({ ...p, memberCount: counts.get(p.id) ?? 0, iAmIn: mine.has(p.id) }));
}

export async function getPodBySlug(slug: string): Promise<Pod | null> {
  const r = await db.select().from(pods).where(eq(pods.slug, slug)).limit(1);
  return r[0] ?? null;
}

export async function getPodMembers(podId: string): Promise<PodMember[]> {
  const rows = await db
    .select({ a: profiles, leader: podMembers.leader })
    .from(podMembers)
    .innerJoin(profiles, eq(podMembers.memberId, profiles.clerkUserId))
    .where(eq(podMembers.podId, podId))
    .orderBy(asc(podMembers.joinedAt));
  return rows
    .map((r) => memberView(r.a, r.leader))
    .sort((a, b) => Number(b.leader) - Number(a.leader)); // leaders first
}

export async function isPodMember(podId: string, meId: string | null): Promise<boolean> {
  if (!meId) return false;
  const r = await db
    .select({ podId: podMembers.podId })
    .from(podMembers)
    .where(sql`${podMembers.podId} = ${podId} and ${podMembers.memberId} = ${meId}`)
    .limit(1);
  return r.length > 0;
}
