import { eq, sql, like, and } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress, podMembers, profiles } from "@/db/schema";
import { getTrajectory, type Trajectory } from "@/lib/trajectory";

/* The Evolve engine: read the member's whole state and decide the single
 * highest-leverage next action. On day one everything is an opening; as steps
 * complete, the "next action" shifts from activation to continuous improvement. */

export type PlanStep = {
  key: string;
  label: string;
  blurb: string;      // why it matters / what to do
  href: string;
  cta: string;
  done: boolean;
  locked?: boolean;   // depends on an earlier step
  lockNote?: string;
};

export type Plan = {
  traj: Trajectory;
  steps: PlanStep[];
  next: PlanStep | null;        // the one thing to do now (null once fully activated)
  activatedCount: number;
  activationTotal: number;
  fullyActivated: boolean;
  onboarded: boolean;
};

export async function getPlan(userId: string | null): Promise<Plan | null> {
  if (!userId) return null;

  const [traj, profileRows, podCountRows, learnRows, buildRows] = await Promise.all([
    getTrajectory(userId),
    db.select({ onboardedAt: profiles.onboardedAt }).from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1),
    db.select({ n: sql<number>`count(*)::int` }).from(podMembers).where(eq(podMembers.memberId, userId)),
    db.select({ n: sql<number>`count(*)::int` }).from(lessonProgress)
      .where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "learn:%"))),
    db.select({ n: sql<number>`count(*)::int` }).from(lessonProgress)
      .where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "build:%"))),
  ]);

  const onboarded = profileRows[0]?.onboardedAt != null;
  const podsJoined = podCountRows[0]?.n ?? 0;
  const learnCount = learnRows[0]?.n ?? 0;
  const buildCount = buildRows[0]?.n ?? 0;
  const moves = traj.movesActive + traj.movesDone;

  // Steps in leverage order. `next` is the first incomplete, unlocked step.
  const steps: PlanStep[] = [
    {
      key: "welcome",
      label: "Book your 1:1 welcome with Adam",
      blurb: "Sixty minutes to walk your Map together and set your first moves. This is your fastest way into motion.",
      href: "/hub/events/welcome", cta: "Book it", done: onboarded,
    },
    {
      key: "map",
      label: "Build your Winning Map",
      blurb: "See exactly where you stand — your exposure, what's driving it, and your one winning move.",
      href: "/hub/map", cta: "Start your Map", done: traj.hasMap,
    },
    {
      key: "pod",
      label: "Join your accountability pod",
      blurb: "The people on the same path who hold you to what you commit to. You move faster when someone's expecting your next step.",
      href: "/hub/pods", cta: "Find your pod", done: podsJoined > 0,
    },
    {
      key: "move",
      label: "Set your first move",
      blurb: "Turn your Map's winning move into a concrete commitment — and start shipping it.",
      href: "/hub/map", cta: "Set a move", done: moves > 0,
      locked: !traj.hasMap, lockNote: "Build your Map first",
    },
    {
      key: "learn",
      label: "Start in the Learn space",
      blurb: "Understand the levers that decide who's exposed and who's protected in the age of AI.",
      href: "/hub/learn", cta: "Open Learn", done: learnCount > 0,
    },
    {
      key: "build",
      label: "Log your first Build rep",
      blurb: "Train the two edges — master the machine, and deepen what AI can't take. The Gym, the Operator, your rebuilds.",
      href: "/hub/build", cta: "Go to Build", done: buildCount > 0,
    },
  ];

  const activationTotal = steps.length;
  const activatedCount = steps.filter((s) => s.done).length;
  const fullyActivated = activatedCount >= activationTotal;
  const next = steps.find((s) => !s.done && !s.locked) ?? null;

  return { traj, steps, next, activatedCount, activationTotal, fullyActivated, onboarded };
}
