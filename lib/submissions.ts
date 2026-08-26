/**
 * Member contributions awaiting founder review. A member proposes a session to
 * host or an article to publish; it sits pending until the founder approves —
 * which promotes it into a real event (they host) or a published feed post — or
 * declines with a note. Founder-only review to begin with.
 */
import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { submissions, events, posts, profiles } from "@/db/schema";
import { notifySubmission, notifySubmissionDecision } from "@/lib/notifications";

export type SubmissionKind = "session" | "article";
export type SubmissionStatus = "pending" | "approved" | "declined";

/** Session details a member fills in when proposing a session to host. */
export type SessionDetails = { type?: string; startsAt?: string; durationMins?: number; joinUrl?: string };
export type ArticleDetails = { topic?: string };

/** Event types a member may propose to host (mirrors the pod-leader set). */
export const MEMBER_SESSION_TYPES = ["sme", "open_stage", "wins", "social"] as const;

export type SubmissionItem = {
  id: string; kind: SubmissionKind; status: SubmissionStatus;
  title: string; body: string; details: SessionDetails & ArticleDetails;
  memberId: string; authorName: string;
  reviewNote: string | null; resultId: string | null;
  createdAt: Date; reviewedAt: Date | null;
};

function shape(r: typeof submissions.$inferSelect & { authorName?: string | null; authorEmail?: string | null }): SubmissionItem {
  return {
    id: r.id, kind: r.kind as SubmissionKind, status: r.status as SubmissionStatus,
    title: r.title, body: r.body, details: (r.details ?? {}) as SessionDetails & ArticleDetails,
    memberId: r.memberId, authorName: r.authorName ?? r.authorEmail?.split("@")[0] ?? "A member",
    reviewNote: r.reviewNote, resultId: r.resultId,
    createdAt: r.createdAt, reviewedAt: r.reviewedAt,
  };
}

/** A member proposes a session or article. Returns the new submission id. */
export async function createSubmission(input: {
  memberId: string; kind: SubmissionKind; title: string; body: string;
  details: SessionDetails | ArticleDetails;
}): Promise<string | null> {
  const title = input.title.trim().slice(0, 200);
  const body = input.body.trim().slice(0, 8000);
  if (!title || !body) return null;
  const inserted = await db.insert(submissions).values({
    memberId: input.memberId, kind: input.kind, title, body, details: input.details,
  }).returning({ id: submissions.id });
  await notifySubmission(input.memberId, input.kind, title);
  return inserted[0]?.id ?? null;
}

/** Pending submissions, oldest first — the founder review queue. */
export async function listPendingSubmissions(): Promise<SubmissionItem[]> {
  const rows = await db.select({
    s: submissions, authorName: profiles.displayName, authorEmail: profiles.email,
  }).from(submissions)
    .innerJoin(profiles, eq(submissions.memberId, profiles.clerkUserId))
    .where(eq(submissions.status, "pending"))
    .orderBy(submissions.createdAt);
  return rows.map((r) => shape({ ...r.s, authorName: r.authorName, authorEmail: r.authorEmail }));
}

/** A member's own submissions (any status), newest first. */
export async function getMySubmissions(memberId: string): Promise<SubmissionItem[]> {
  const rows = await db.select().from(submissions)
    .where(eq(submissions.memberId, memberId))
    .orderBy(desc(submissions.createdAt));
  return rows.map((r) => shape(r));
}

export async function pendingSubmissionCount(): Promise<number> {
  const r = await db.select({ n: sql<number>`count(*)::int` }).from(submissions)
    .where(eq(submissions.status, "pending"));
  return r[0]?.n ?? 0;
}

/** Founder approves: promote the submission into a real event or published post. */
export async function approveSubmission(id: string, byId: string): Promise<void> {
  const row = (await db.select().from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.status, "pending"))).limit(1))[0];
  if (!row) return;
  const details = (row.details ?? {}) as SessionDetails & ArticleDetails;

  let resultId: string | null = null;
  let href = "/hub/community";

  if (row.kind === "session") {
    const typeRaw = details.type ?? "sme";
    const type = (MEMBER_SESSION_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "sme";
    const startsAt = details.startsAt ? new Date(details.startsAt) : new Date(Date.now() + 7 * 864e5);
    const inserted = await db.insert(events).values({
      title: row.title.slice(0, 200),
      type: type as typeof events.$inferInsert.type,
      description: row.body.slice(0, 2000) || null,
      startsAt: isNaN(startsAt.getTime()) ? new Date(Date.now() + 7 * 864e5) : startsAt,
      durationMins: details.durationMins || 45,
      joinUrl: details.joinUrl?.slice(0, 500) || null,
      hostId: row.memberId, // the member hosts their own session
    }).returning({ id: events.id });
    resultId = inserted[0]?.id ?? null;
    href = "/hub/events";
  } else {
    const inserted = await db.insert(posts).values({
      authorId: row.memberId,
      title: row.title.slice(0, 160),
      topic: "member-article",
      body: row.body.slice(0, 5000),
    }).returning({ id: posts.id });
    resultId = inserted[0]?.id ?? null;
    href = resultId ? `/hub/community#post-${resultId}` : "/hub/community";
  }

  await db.update(submissions).set({
    status: "approved", reviewedBy: byId, reviewedAt: new Date(), resultId,
  }).where(eq(submissions.id, id));
  await notifySubmissionDecision(row.memberId, row.kind, row.title, true, href);
}

/** Founder declines, with an optional note the member sees. */
export async function declineSubmission(id: string, byId: string, note?: string): Promise<void> {
  const row = (await db.select().from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.status, "pending"))).limit(1))[0];
  if (!row) return;
  await db.update(submissions).set({
    status: "declined", reviewedBy: byId, reviewedAt: new Date(),
    reviewNote: note?.trim().slice(0, 1000) || null,
  }).where(eq(submissions.id, id));
  await notifySubmissionDecision(row.memberId, row.kind, row.title, false, "/hub/contribute");
}
