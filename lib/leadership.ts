import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { domainLeaders, leadershipInterest, pods, podMembers, podCheckins, profiles } from "@/db/schema";
import { isoWeekKey } from "@/lib/gym-gate";

/* Domain leaders steward every pod in a domain (a lane grouping). Interest is
 * expressed in onboarding; the founder approves. */

export async function ledDomains(userId: string | null): Promise<string[]> {
  if (!userId) return [];
  const rows = await db.select({ d: domainLeaders.domain }).from(domainLeaders).where(eq(domainLeaders.memberId, userId));
  return rows.map((r) => r.d);
}
export async function isDomainLeader(userId: string | null): Promise<boolean> {
  return (await ledDomains(userId)).length > 0;
}

export type DomainPod = {
  slug: string; name: string; crest: string | null; lane: string | null; region: string | null;
  memberCount: number; capacity: number; streakWeeks: number; checkedIn: number; listable: boolean;
};

/** Every pod in the domain, with the health a leader needs to see. */
export async function podsForDomain(domain: string): Promise<DomainPod[]> {
  const all = await db.select().from(pods).where(sql`${pods.lane} ILIKE ${"%" + domain + "%"}`);
  if (!all.length) return [];
  const ids = all.map((p) => p.id);
  const [counts, checks] = await Promise.all([
    db.select({ podId: podMembers.podId, n: sql<number>`count(*)::int` }).from(podMembers)
      .where(and(eq(podMembers.auto, false), inArray(podMembers.podId, ids))).groupBy(podMembers.podId),
    db.select({ podId: podCheckins.podId, n: sql<number>`count(*)::int` }).from(podCheckins)
      .where(and(eq(podCheckins.isoWeek, isoWeekKey()), inArray(podCheckins.podId, ids))).groupBy(podCheckins.podId),
  ]);
  const countBy = new Map(counts.map((r) => [r.podId, r.n]));
  const checkBy = new Map(checks.map((r) => [r.podId, r.n]));
  return all.map((p) => ({
    slug: p.slug, name: p.name, crest: p.crest, lane: p.lane, region: p.region,
    memberCount: countBy.get(p.id) ?? 0, capacity: p.capacity, streakWeeks: p.streakWeeks,
    checkedIn: checkBy.get(p.id) ?? 0, listable: p.listable,
  })).sort((a, b) => b.memberCount - a.memberCount);
}

/* ---- interest / applications ---- */
export type Interest = { id: string; memberId: string; name: string; handle: string | null; role: string; domain: string | null; note: string | null; createdAt: Date };

export async function myOpenInterest(userId: string | null): Promise<{ role: string; domain: string | null }[]> {
  if (!userId) return [];
  const rows = await db.select({ role: leadershipInterest.role, domain: leadershipInterest.domain })
    .from(leadershipInterest)
    .where(and(eq(leadershipInterest.memberId, userId), eq(leadershipInterest.status, "open")));
  return rows;
}

export async function expressInterest(userId: string, role: "captain" | "domain", domain: string | null, note: string | null): Promise<void> {
  const dupe = await db.select({ id: leadershipInterest.id }).from(leadershipInterest)
    .where(and(eq(leadershipInterest.memberId, userId), eq(leadershipInterest.role, role), eq(leadershipInterest.status, "open")));
  if (dupe.length) return; // already an open interest for this role
  await db.insert(leadershipInterest).values({ memberId: userId, role, domain: domain?.slice(0, 60) || null, note: note?.slice(0, 500) || null });
}

/** Founder: open leadership interest, newest first, with member identity. */
export async function listOpenInterest(): Promise<Interest[]> {
  const rows = await db
    .select({ i: leadershipInterest, name: profiles.displayName, handle: profiles.handle })
    .from(leadershipInterest)
    .innerJoin(profiles, eq(leadershipInterest.memberId, profiles.clerkUserId))
    .where(eq(leadershipInterest.status, "open"))
    .orderBy(desc(leadershipInterest.createdAt));
  return rows.map((r) => ({
    id: r.i.id, memberId: r.i.memberId, name: r.name ?? "Member", handle: r.handle,
    role: r.i.role, domain: r.i.domain, note: r.i.note, createdAt: r.i.createdAt,
  }));
}

/** Founder: approve or decline an interest. Approving a domain interest assigns
 *  the domain-leader role. */
export async function resolveInterest(id: string, approve: boolean): Promise<void> {
  const rows = await db.select().from(leadershipInterest).where(eq(leadershipInterest.id, id)).limit(1);
  const it = rows[0];
  if (!it) return;
  await db.update(leadershipInterest).set({ status: approve ? "approved" : "declined" }).where(eq(leadershipInterest.id, id));
  if (approve && it.role === "domain" && it.domain) {
    const exists = await db.select({ id: domainLeaders.id }).from(domainLeaders)
      .where(and(eq(domainLeaders.memberId, it.memberId), eq(domainLeaders.domain, it.domain)));
    if (!exists.length) await db.insert(domainLeaders).values({ memberId: it.memberId, domain: it.domain });
  }
}
