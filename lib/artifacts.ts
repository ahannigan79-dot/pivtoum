import "server-only";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { moveArtifacts, profiles } from "@/db/schema";
import { ledDomains } from "@/lib/leadership";

/* Proof-of-work for a completed play. The member submits the artifact the play
 * built (a link or a note); it files into their Library and a domain leader
 * reviews it → verified. Provisional by design: the move already moved the score
 * — this adds proof, a Library asset, and the verified stamp. */

export type ArtifactStatus = "submitted" | "verified" | "returned";
export type MoveArtifact = {
  id: string; goalId: string | null; playSlug: string; playTitle: string;
  kind: "link" | "note"; url: string | null; body: string | null;
  status: ArtifactStatus; reviewNote: string | null; createdAt: Date; reviewedAt: Date | null;
};

/** Submit (or resubmit) the artifact for a completed play. One per goal; a
 *  resubmission after a return replaces the prior row and re-opens review. */
export async function submitArtifact(
  userId: string, opts: { goalId: string | null; playSlug: string; playTitle: string; kind: "link" | "note"; url?: string; body?: string },
): Promise<void> {
  const domainRow = await db.select({ lane: profiles.currentLane, career: profiles.careerSlug })
    .from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1);
  const domain = domainRow[0]?.lane ?? domainRow[0]?.career ?? null;
  const values = {
    memberId: userId, goalId: opts.goalId, playSlug: opts.playSlug, playTitle: opts.playTitle,
    kind: opts.kind, url: opts.url ?? null, body: opts.body ?? null, domain,
    status: "submitted" as const, reviewerId: null, reviewNote: null, reviewedAt: null,
  };
  // Replace any existing artifact for this goal (resubmission re-opens review).
  if (opts.goalId) {
    const existing = await db.select({ id: moveArtifacts.id }).from(moveArtifacts)
      .where(and(eq(moveArtifacts.memberId, userId), eq(moveArtifacts.goalId, opts.goalId))).limit(1);
    if (existing[0]) {
      await db.update(moveArtifacts).set(values).where(eq(moveArtifacts.id, existing[0].id));
      return;
    }
  }
  await db.insert(moveArtifacts).values(values);
}

function row(r: typeof moveArtifacts.$inferSelect): MoveArtifact {
  return { id: r.id, goalId: r.goalId, playSlug: r.playSlug, playTitle: r.playTitle,
    kind: (r.kind as "link" | "note"), url: r.url, body: r.body, status: r.status as ArtifactStatus,
    reviewNote: r.reviewNote, createdAt: r.createdAt, reviewedAt: r.reviewedAt };
}

/** All of a member's artifacts — their Library assets. */
export async function myArtifacts(userId: string | null): Promise<MoveArtifact[]> {
  if (!userId) return [];
  const rows = await db.select().from(moveArtifacts)
    .where(eq(moveArtifacts.memberId, userId)).orderBy(desc(moveArtifacts.createdAt));
  return rows.map(row);
}

/** Status of the artifact for one goal (to drive the FocusPanel prompt). */
export async function artifactStatusByGoal(userId: string | null): Promise<Record<string, ArtifactStatus>> {
  if (!userId) return {};
  const rows = await db.select({ goalId: moveArtifacts.goalId, status: moveArtifacts.status })
    .from(moveArtifacts).where(eq(moveArtifacts.memberId, userId));
  const out: Record<string, ArtifactStatus> = {};
  for (const r of rows) if (r.goalId) out[r.goalId] = r.status as ArtifactStatus;
  return out;
}

export type PendingArtifact = MoveArtifact & { memberId: string; memberName: string; handle: string | null; domain: string | null };

/** Submitted artifacts a domain leader should review — members whose lane sits
 *  in a domain they steward. */
export async function pendingForLeader(userId: string | null): Promise<PendingArtifact[]> {
  const domains = await ledDomains(userId);
  if (!domains.length) return [];
  const rows = await db
    .select({ a: moveArtifacts, name: profiles.displayName, email: profiles.email, handle: profiles.handle })
    .from(moveArtifacts)
    .innerJoin(profiles, eq(moveArtifacts.memberId, profiles.clerkUserId))
    .where(and(
      eq(moveArtifacts.status, "submitted"),
      or(...domains.map((d) => sql`${moveArtifacts.domain} ILIKE ${"%" + d + "%"}`)),
    ))
    .orderBy(desc(moveArtifacts.createdAt));
  return rows.map((r) => ({ ...row(r.a), memberId: r.a.memberId, memberName: r.name ?? r.email?.split("@")[0] ?? "Member", handle: r.handle, domain: r.a.domain }));
}

/** True when the reviewer leads a domain that covers this artifact (server auth). */
async function mayReview(userId: string | null, artifactId: string): Promise<boolean> {
  if (!userId) return false;
  const domains = await ledDomains(userId);
  if (!domains.length) return false;
  const rows = await db.select({ domain: moveArtifacts.domain }).from(moveArtifacts).where(eq(moveArtifacts.id, artifactId)).limit(1);
  const d = (rows[0]?.domain ?? "").toLowerCase();
  return domains.some((led) => d.includes(led.toLowerCase()));
}

export async function verifyArtifact(userId: string | null, artifactId: string): Promise<boolean> {
  if (!(await mayReview(userId, artifactId))) return false;
  await db.update(moveArtifacts).set({ status: "verified", reviewerId: userId!, reviewedAt: new Date(), reviewNote: null })
    .where(eq(moveArtifacts.id, artifactId));
  return true;
}

export async function returnArtifact(userId: string | null, artifactId: string, note: string): Promise<boolean> {
  if (!(await mayReview(userId, artifactId))) return false;
  await db.update(moveArtifacts).set({ status: "returned", reviewerId: userId!, reviewedAt: new Date(), reviewNote: note.slice(0, 400) || null })
    .where(eq(moveArtifacts.id, artifactId));
  return true;
}

/** How many verified move-artifacts a member has — a "verified" credential signal. */
export async function verifiedCount(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const r = await db.select({ n: sql<number>`count(*)::int` }).from(moveArtifacts)
    .where(and(eq(moveArtifacts.memberId, userId), eq(moveArtifacts.status, "verified")));
  return r[0]?.n ?? 0;
}
