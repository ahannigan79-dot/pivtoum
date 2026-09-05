import { getPlan, type Plan } from "@/lib/plan";

/* The guided onboarding — the "welcome bot" path. A focused, ordered sequence
 * (Map → Pod → Learn → First move → Welcome call) derived from the member's
 * real state. `current` is the one step to do now; everything after the Map is
 * locked until the Map exists, so the flow is strictly do-this-then-this. */

export type OnbStep = {
  key: string;
  label: string;
  blurb: string;
  href: string;
  cta: string;
  done: boolean;
  locked: boolean;
  lockNote?: string;
};

export type Onboarding = {
  steps: OnbStep[];
  current: OnbStep | null;   // the single next action (null once complete)
  doneCount: number;
  total: number;
  complete: boolean;
  stepNumber: number;        // 1-based index of the current step (total+1 when complete)
};

/** Pure reshaper — turns a Plan into the guided onboarding view. No DB work, so
 *  the dashboard (which already has a Plan) can call it for free. */
export function onboardingView(plan: Plan): Onboarding {
  const done = (k: string) => !!plan.steps.find((s) => s.key === k)?.done;
  const hasMap = done("map");

  const steps: OnbStep[] = [
    {
      key: "map", label: "Build your Winning Map",
      blurb: "See exactly where you stand — your exposure, what's driving it, and your one winning move. Everything else builds on this.",
      href: "/hub/map", cta: "Build your Map", done: hasMap, locked: false,
    },
    {
      key: "pod", label: "Choose your Together pod",
      blurb: "Your team inside the community — a handful of people in your exact lane. This is who keeps you moving, and it's the single biggest reason members stick.",
      href: "/hub/pods", cta: "Find your pod", done: done("pod"), locked: !hasMap, lockNote: "Build your Map first",
    },
    {
      key: "learn", label: "Learn the key levers",
      blurb: "A few short lessons on the levers that decide who's exposed and who's protected. Start with these — you don't need the whole library yet.",
      href: "/hub/learn", cta: "Open Learn", done: done("learn"), locked: !hasMap, lockNote: "Build your Map first",
    },
    {
      key: "move", label: "Commit your first move",
      blurb: "Turn your Map's winning move into a concrete commitment — and start shipping it. This is where reading becomes doing.",
      href: "/hub/map", cta: "Set your move", done: done("move"), locked: !hasMap, lockNote: "Build your Map first",
    },
    {
      key: "welcome", label: "Book your welcome call with Adam",
      blurb: "Sixty minutes to walk your Map together and lock your plan. Book it once you've done the work above — you'll get far more from the call.",
      href: "/hub/events/welcome", cta: "Book your call", done: done("welcome"), locked: false,
    },
  ];

  const current = steps.find((s) => !s.done && !s.locked) ?? null;
  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const idx = current ? steps.indexOf(current) : total;
  return { steps, current, doneCount, total, complete: doneCount >= total, stepNumber: idx + 1 };
}

/** Convenience wrapper for pages that don't already hold a Plan. */
export async function getOnboarding(userId: string | null): Promise<Onboarding | null> {
  const plan = await getPlan(userId);
  return plan ? onboardingView(plan) : null;
}
