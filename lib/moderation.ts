import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { postReports, posts, pods, profiles } from "@/db/schema";

export type ReportItem = {
  postId: string; href: string; body: string;
  authorId: string; authorName: string; podName: string;
  reasons: string[]; count: number; firstAt: Date;
};

/** Open (unresolved) post reports, grouped by post, oldest first. Founder-only view. */
export async function getOpenReports(): Promise<ReportItem[]> {
  const rows = await db.select({
    postId: postReports.postId, reason: postReports.reason, at: postReports.createdAt,
  }).from(postReports).where(isNull(postReports.resolvedAt)).orderBy(asc(postReports.createdAt));
  if (!rows.length) return [];

  const postIds = [...new Set(rows.map((r) => r.postId))];
  const postRows = await db.select({
    id: posts.id, body: posts.body, authorId: posts.authorId, podId: posts.podId,
    authorName: profiles.displayName, authorEmail: profiles.email, podName: pods.name, podSlug: pods.slug,
  }).from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.clerkUserId))
    .leftJoin(pods, eq(posts.podId, pods.id))
    .where(inArray(posts.id, postIds));
  const byId = new Map(postRows.map((p) => [p.id, p]));

  const grouped = new Map<string, ReportItem>();
  for (const r of rows) {
    const p = byId.get(r.postId);
    if (!p) continue; // post already deleted
    const existing = grouped.get(r.postId);
    if (existing) {
      existing.count++;
      if (r.reason) existing.reasons.push(r.reason);
    } else {
      grouped.set(r.postId, {
        postId: r.postId,
        href: p.podSlug ? `/hub/pods/${p.podSlug}#post-${r.postId}` : `/hub/community#post-${r.postId}`,
        body: p.body, authorId: p.authorId, authorName: p.authorName ?? p.authorEmail.split("@")[0],
        podName: p.podName ?? "Community", reasons: r.reason ? [r.reason] : [], count: 1, firstAt: r.at,
      });
    }
  }
  return [...grouped.values()];
}

/** Mark every open report on a post as resolved (post kept). */
export async function resolvePostReports(postId: string, byId: string): Promise<void> {
  await db.update(postReports).set({ resolvedAt: new Date(), resolvedBy: byId })
    .where(and(eq(postReports.postId, postId), isNull(postReports.resolvedAt)));
}

export async function openReportCount(): Promise<number> {
  const rows = await db.select({ id: postReports.postId }).from(postReports).where(isNull(postReports.resolvedAt));
  return new Set(rows.map((r) => r.id)).size;
}
