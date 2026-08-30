import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, profiles } from "@/db/schema";
import { getFounderIds } from "@/lib/pods";

/** First founder id, or null if none exists yet. Seed posts are authored by them. */
export async function seedAuthor(): Promise<string | null> {
  const founders = await getFounderIds();
  if (!founders.length) return null;
  // Prefer a founder that actually has a profile row (FK target).
  const rows = await db.select({ id: profiles.clerkUserId }).from(profiles)
    .where(eq(profiles.clerkUserId, founders[0])).limit(1);
  return rows[0]?.id ?? null;
}

async function postCount(where: ReturnType<typeof and> | ReturnType<typeof eq>): Promise<number> {
  const r = await db.select({ n: sql<number>`count(*)::int` }).from(posts).where(where);
  return r[0]?.n ?? 0;
}

/** Seed a warm, pinned welcome post in a pod so it's never an empty room. Idempotent.
 *  Lands in the announcements thread so it shows in the pod's default view. */
export async function ensurePodWelcome(podId: string, podName: string, goal: string | null, threadId: string | null): Promise<void> {
  if (await postCount(eq(posts.podId, podId)) > 0) return;
  const author = await seedAuthor();
  if (!author) return;
  const body =
    `Welcome to ${podName} 👋\n\n` +
    (goal ? `Our focus: ${goal}\n\n` : "") +
    `This is your Together pod — a small group holding each other accountable while the field shifts. ` +
    `Two ways to start:\n\n` +
    `• Introduce yourself: where you are, and the one move you're working on right now.\n` +
    `• Share your Map — post your exposure and winning strategy so we can back each other.\n\n` +
    `We keep it Embrace (own the change) and Together (nobody wins alone). Glad you're here. — Adam`;
  await db.insert(posts).values({
    authorId: author, podId, threadId, title: `Welcome to ${podName}`, body, pinned: true, pinnedAt: new Date(),
  });
}

/** Seed a pinned welcome post in the whole-community feed. Idempotent. */
export async function ensureCommunityWelcome(): Promise<void> {
  if (await postCount(and(isNull(posts.podId), eq(posts.pinned, true))) > 0) return;
  const author = await seedAuthor();
  if (!author) return;
  const body =
    `Welcome to Winning in the Age of AI 👋\n\n` +
    `This is the room where we figure out how to stay ahead of the machine — together, and out loud.\n\n` +
    `A good first post: what you do, what you're most worried AI changes about it, and the one thing you're trying this month. ` +
    `Someone here has been exactly where you are.\n\n` +
    `Two values hold this place up: Embrace — we run toward the change, not away from it. Together — nobody wins alone. — Adam`;
  await db.insert(posts).values({
    authorId: author, title: "Start here — welcome in", body, pinned: true, pinnedAt: new Date(),
  });
}
