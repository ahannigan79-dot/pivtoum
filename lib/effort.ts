import { and, eq, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { commitments, comments, lessonProgress, mapStates, podMembers, posts, profiles, reactions } from "@/db/schema";

/* Effort = the work the member puts in. Unlike exposure (the market challenge,
 * which only a re-score moves), effort is fully in their control and only ever
 * grows. It's the "putting in the work" score — a key factor in winning. */

export type MemberActivity = {
  maps: number; reScores: number; buildReps: number; shipped: number; active: number;
  learn: number; posts: number; comments: number; reactions: number;
  pods: number; streak: number; visits: number;
};

const N = sql<number>`count(*)::int`;
const one = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;

export async function getMemberActivity(userId: string): Promise<MemberActivity> {
  const [maps, buildReps, shipped, active, learn, postsN, commentsN, reactsN, pods, prof] = await Promise.all([
    one(db.select({ n: N }).from(mapStates).where(eq(mapStates.memberId, userId))),
    one(db.select({ n: N }).from(lessonProgress).where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "build:%")))),
    one(db.select({ n: N }).from(commitments).where(and(eq(commitments.memberId, userId), eq(commitments.status, "done")))),
    one(db.select({ n: N }).from(commitments).where(and(eq(commitments.memberId, userId), eq(commitments.status, "active")))),
    one(db.select({ n: N }).from(lessonProgress).where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "learn:%")))),
    one(db.select({ n: N }).from(posts).where(eq(posts.authorId, userId))),
    one(db.select({ n: N }).from(comments).where(eq(comments.authorId, userId))),
    one(db.select({ n: N }).from(reactions).where(eq(reactions.memberId, userId))),
    one(db.select({ n: N }).from(podMembers).where(eq(podMembers.memberId, userId))),
    db.select({ streak: profiles.streakDays, visits: profiles.visitDays }).from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1),
  ]);
  return {
    maps, reScores: Math.max(0, maps - 1), buildReps, shipped, active,
    learn, posts: postsN, comments: commentsN, reactions: reactsN,
    pods, streak: prof[0]?.streak ?? 0, visits: prof[0]?.visits ?? 0,
  };
}

/** Effort points. Everything that shows the member is putting in the work. */
export function computeEffort(a: MemberActivity): number {
  return Math.round(
    12 * a.maps +               // mapping + every re-score
    10 * a.shipped +            // moves shipped (the real work)
    4 * a.active +              // moves committed and in flight
    6 * a.buildReps +           // training reps
    5 * a.learn +               // studying the levers
    6 * a.pods +                // showing up in a pod
    3 * a.posts +               // contributing
    2 * a.comments +            // helping others
    1 * a.reactions +           // being present
    2 * Math.min(a.streak, 14), // showing up, day after day (capped)
  );
}

/** The lines that make up the effort score — shown so it feels earned, not opaque. */
export function effortBreakdown(a: MemberActivity): { label: string; n: number }[] {
  return [
    { label: "re-scores", n: a.reScores },
    { label: "moves shipped", n: a.shipped },
    { label: "build reps", n: a.buildReps },
    { label: "lessons", n: a.learn },
    { label: "contributions", n: a.posts + a.comments },
    { label: "day streak", n: a.streak },
  ].filter((x) => x.n > 0);
}
