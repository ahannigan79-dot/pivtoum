import "server-only";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { focusGoals, focusSteps } from "@/db/schema";
import { getPlay } from "@/lib/plays";
import { leverWeight } from "@/lib/moves";

/* Focus goals — the member's 1–2 chosen plays, tracked on Evolve. A play adopted
 * from the Map/Playbook becomes a goal with its how-to steps copied in as a
 * checklist. Completing steps drives a capped "focus dividend" that lowers the
 * exposure score, so doing the work visibly moves the number. */

export type FocusStep = { id: string; idx: number; title: string; detail: string | null; done: boolean };
export type FocusGoal = {
  id: string; playSlug: string; title: string; lever: string; aim: string | null;
  steps: FocusStep[]; doneCount: number; total: number; complete: boolean;
  benefit: number;   // exposure this goal buys down at full completion (per-lever)
  earned: number;    // exposure bought down so far from its done steps
};

export const MAX_ACTIVE_FOCUS = 2;
const PT_PER_STEP = 0.5;   // base buy-down per completed step, scaled by the lever…
const FOCUS_CAP = 6;       // …capped in total, so focus never overwhelms the baseline

/** Exposure a single completed step of this lever buys down — the base half-point
 *  scaled by how much that lever moves personal exposure (see lib/moves.ts). */
export function stepValue(lever: string | null | undefined): number {
  return PT_PER_STEP * leverWeight(lever);
}

/** Active focus goals with their step checklists and progress. */
export async function getFocus(userId: string | null): Promise<FocusGoal[]> {
  if (!userId) return [];
  const goals = await db.select().from(focusGoals)
    .where(and(eq(focusGoals.memberId, userId), eq(focusGoals.status, "active")))
    .orderBy(asc(focusGoals.createdAt));
  if (!goals.length) return [];
  const steps = await db.select().from(focusSteps)
    .where(eq(focusSteps.memberId, userId)).orderBy(asc(focusSteps.idx));
  return goals.map((g) => {
    const s: FocusStep[] = steps.filter((x) => x.goalId === g.id)
      .map((x) => ({ id: x.id, idx: x.idx, title: x.title, detail: x.detail, done: x.done }));
    const doneCount = s.filter((x) => x.done).length;
    const per = stepValue(g.lever);
    const round = (n: number) => Math.round(n * 10) / 10;
    return { id: g.id, playSlug: g.playSlug, title: g.title, lever: g.lever, aim: g.aim, steps: s,
      doneCount, total: s.length, complete: s.length > 0 && doneCount === s.length,
      benefit: round(per * s.length), earned: round(per * doneCount) };
  });
}

/** True when the member can take on another focus (under the cap). */
export async function canAddFocus(userId: string): Promise<boolean> {
  const active = await db.select({ id: focusGoals.id }).from(focusGoals)
    .where(and(eq(focusGoals.memberId, userId), eq(focusGoals.status, "active")));
  return active.length < MAX_ACTIVE_FOCUS;
}

/** Adopt a play as a focus goal, seeding its how-to steps as a checklist. */
export async function adoptPlayAsFocus(userId: string, playSlug: string): Promise<void> {
  const play = getPlay(playSlug);
  if (!play) return;
  const mine = await db.select({ id: focusGoals.id, status: focusGoals.status }).from(focusGoals)
    .where(and(eq(focusGoals.memberId, userId), eq(focusGoals.playSlug, playSlug)));
  if (mine.some((e) => e.status === "active")) return;   // already a focus
  if (!(await canAddFocus(userId))) return;              // at the cap — UI guards this
  const inserted = await db.insert(focusGoals).values({
    memberId: userId, playSlug, title: play.title, lever: play.lever, aim: play.aim,
  }).returning({ id: focusGoals.id });
  const goalId = inserted[0]?.id;
  if (!goalId) return;
  const rows = play.steps.map((st, i) => ({ goalId, memberId: userId, idx: i, title: st.title, detail: st.detail }));
  if (rows.length) await db.insert(focusSteps).values(rows);
}

/** Toggle a step; when every step of a goal is done, the goal is marked complete. */
export async function toggleFocusStep(userId: string, stepId: string): Promise<void> {
  const rows = await db.select().from(focusSteps)
    .where(and(eq(focusSteps.id, stepId), eq(focusSteps.memberId, userId))).limit(1);
  const st = rows[0];
  if (!st) return;
  const done = !st.done;
  await db.update(focusSteps).set({ done, completedAt: done ? new Date() : null }).where(eq(focusSteps.id, stepId));
  const all = await db.select({ done: focusSteps.done }).from(focusSteps).where(eq(focusSteps.goalId, st.goalId));
  const allDone = all.length > 0 && all.every((x) => x.done);
  await db.update(focusGoals)
    .set({ status: allDone ? "done" : "active", completedAt: allDone ? new Date() : null })
    .where(eq(focusGoals.id, st.goalId));
}

/** Stop tracking a focus goal (keeps its history, hides it from the dashboard). */
export async function dropFocus(userId: string, goalId: string): Promise<void> {
  await db.update(focusGoals).set({ status: "dropped" })
    .where(and(eq(focusGoals.id, goalId), eq(focusGoals.memberId, userId)));
}

/** Capped exposure reduction earned by completing focus-goal steps (excludes
 *  dropped goals). Each done step is worth the base half-point scaled by its
 *  play's lever — so which goals you finish, not just how many steps, moves the
 *  score. Rounded and capped so it stays credible. */
export async function focusDividend(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const rows = await db.select({ lever: focusGoals.lever }).from(focusSteps)
    .innerJoin(focusGoals, eq(focusSteps.goalId, focusGoals.id))
    .where(and(eq(focusSteps.memberId, userId), eq(focusSteps.done, true), ne(focusGoals.status, "dropped")));
  const raw = rows.reduce((sum, r) => sum + stepValue(r.lever), 0);
  return Math.min(FOCUS_CAP, Math.round(raw));
}
