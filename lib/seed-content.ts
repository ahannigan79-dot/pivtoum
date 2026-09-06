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
    `Here's how to land well:\n\n` +
    `1. Say hello 👋 — introduce yourself: where you are, and what brought you here.\n` +
    `2. Do the work: finish your Map, get into the Learn material, and lock your openings.\n` +
    `3. Then share your Map — once it's final you'll be able to post it here, and we'll back each other's moves.\n\n` +
    `No rush to post your Map on day one — it means more once you've absorbed it. ` +
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

/** Seed one warm starter post in each member-facing topic so no topic ever reads
 *  "Nothing here yet" on a fresh community. Idempotent per topic — a starter is
 *  only added when that topic has no posts at all. Authored by the founder. */
const TOPIC_STARTERS: { topic: string; title: string; body: string }[] = [
  {
    topic: "introductions",
    title: "Introduce yourself 👋",
    body:
      `New here? This is the place to say hello. A good intro is three lines:\n\n` +
      `• What you do (role + field).\n` +
      `• The one thing about AI you're most watching in your work.\n` +
      `• What you're hoping to get out of being here.\n\n` +
      `Reply below — someone in the room has been exactly where you are. — Adam`,
  },
  {
    topic: "wins",
    title: "Post your first win — however small",
    body:
      `Momentum is built out loud. Shipped a rebuild? Had a manager notice your AI-native work? ` +
      `Landed an interview? Post it here — a win named is a win the room can learn from.\n\n` +
      `No win is too small. The person who posts "I finally automated the weekly report" today is ` +
      `the person teaching a lunch-and-learn next month. — Adam`,
  },
  {
    topic: "ask",
    title: "Ask the room — no question too small",
    body:
      `Stuck on a tool? Trying to read where your field is heading? Not sure which move to make first? ` +
      `Ask here. This room runs on generosity — assume good faith and answer where you can.\n\n` +
      `The best questions are specific: your role, what you tried, and where it broke. — Adam`,
  },
  {
    topic: "rebuilds",
    title: "Share a workflow you're rebuilding AI-native",
    body:
      `Pick one thing you do every week and show how you're rebuilding it with AI — before/after, ` +
      `what it used to take, what it takes now, and where your judgment still carries it.\n\n` +
      `Post the method, not just the result. Teaching it is what marks you as the expert. — Adam`,
  },
];

export async function ensureFeedTopicSeeds(): Promise<void> {
  const author = await seedAuthor();
  if (!author) return;
  for (const s of TOPIC_STARTERS) {
    if (await postCount(and(isNull(posts.podId), eq(posts.topic, s.topic))) > 0) continue;
    await db.insert(posts).values({ authorId: author, topic: s.topic, title: s.title, body: s.body });
  }
}
