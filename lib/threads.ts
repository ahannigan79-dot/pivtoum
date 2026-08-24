import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { podThreads } from "@/db/schema";

export type Thread = typeof podThreads.$inferSelect;

/** Core threads every pod gets, prepopulated. */
export const CORE_THREADS: { slug: string; name: string; emoji: string; sort: number }[] = [
  { slug: "announcements", name: "Announcements", emoji: "📣", sort: 0 },
  { slug: "introductions", name: "Introductions", emoji: "👋", sort: 1 },
  { slug: "wins", name: "Wins & milestones", emoji: "🏆", sort: 2 },
  { slug: "stuck", name: "Stuck — ask the pod", emoji: "🆘", sort: 3 },
  { slug: "check-in", name: "Weekly check-in", emoji: "📅", sort: 4 },
  { slug: "resources", name: "Resources & links", emoji: "🔗", sort: 5 },
];

/** Ensure a pod has its core threads (idempotent), then return all threads in order. */
export async function getPodThreads(podId: string): Promise<Thread[]> {
  const existing = await db.select().from(podThreads).where(eq(podThreads.podId, podId));
  const have = new Set(existing.map((t) => t.slug));
  const missing = CORE_THREADS.filter((c) => !have.has(c.slug));
  if (missing.length) {
    await db.insert(podThreads).values(
      missing.map((c) => ({ podId, name: c.name, emoji: c.emoji, slug: c.slug, sortOrder: c.sort, isCore: true })),
    ).onConflictDoNothing();
  }
  return db.select().from(podThreads).where(eq(podThreads.podId, podId))
    .orderBy(asc(podThreads.sortOrder), asc(podThreads.createdAt));
}

export async function getThreadBySlug(podId: string, slug: string): Promise<Thread | null> {
  const r = await db.select().from(podThreads)
    .where(and(eq(podThreads.podId, podId), eq(podThreads.slug, slug))).limit(1);
  return r[0] ?? null;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "thread";
}

/** Create a member-made thread in a pod, with a unique slug. */
export async function createThreadIn(podId: string, name: string, emoji: string | null): Promise<Thread | null> {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; (await getThreadBySlug(podId, slug)) != null; i++) slug = `${base}-${i}`;
  const rows = await db.insert(podThreads)
    .values({ podId, name: name.slice(0, 80), emoji: emoji?.slice(0, 8) || "💬", slug, sortOrder: 100, isCore: false })
    .returning();
  return rows[0] ?? null;
}
