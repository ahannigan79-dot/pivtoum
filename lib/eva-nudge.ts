import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { focusGoals, focusSteps, notifications } from "@/db/schema";
import { notifyEva } from "@/lib/notifications";

/* Proactive Eva — between-sessions nudges. When a member commits a focus play
 * and then goes quiet, Eva prompts them to their next step. Deliberately gentle:
 * only when a goal has genuinely stalled, at most once per goal per cooldown. */

const NUDGE_AFTER_DAYS = 4;     // a goal must be quiet this long before a nudge
const NUDGE_COOLDOWN_DAYS = 5;  // never re-nudge the same goal inside this window
const DAY = 86400000;

export async function runEvaNudges(now: Date = new Date()): Promise<{ scanned: number; nudged: number }> {
  const goals = await db
    .select({ id: focusGoals.id, memberId: focusGoals.memberId, title: focusGoals.title, createdAt: focusGoals.createdAt })
    .from(focusGoals).where(eq(focusGoals.status, "active"));
  if (!goals.length) return { scanned: 0, nudged: 0 };
  const goalIds = goals.map((g) => g.id);

  const [steps, recent] = await Promise.all([
    db.select({ goalId: focusSteps.goalId, idx: focusSteps.idx, title: focusSteps.title, done: focusSteps.done, completedAt: focusSteps.completedAt })
      .from(focusSteps).where(inArray(focusSteps.goalId, goalIds)),
    // Goals already nudged inside the cooldown window — skip these.
    db.select({ gid: sql<string>`${notifications.payload}->>'entityId'` }).from(notifications)
      .where(and(eq(notifications.type, "eva"), sql`${notifications.createdAt} > ${new Date(now.getTime() - NUDGE_COOLDOWN_DAYS * DAY)}`)),
  ]);
  const recentSet = new Set(recent.map((r) => r.gid).filter(Boolean));
  const stallMs = NUDGE_AFTER_DAYS * DAY;

  let nudged = 0;
  for (const g of goals) {
    if (recentSet.has(g.id)) continue;
    const gs = steps.filter((s) => s.goalId === g.id).sort((a, b) => a.idx - b.idx);
    if (!gs.length) continue;
    const next = gs.find((s) => !s.done);
    if (!next) continue;                                    // every step done — nothing to nudge
    const doneTimes = gs.filter((s) => s.done && s.completedAt).map((s) => s.completedAt!.getTime());
    const lastActivity = doneTimes.length ? Math.max(...doneTimes) : g.createdAt.getTime();
    if (now.getTime() - lastActivity < stallMs) continue;   // still fresh — leave them be
    const started = doneTimes.length > 0;
    await notifyEva(g.memberId, {
      title: started ? "Eva ✨ Your next step is waiting" : "Eva ✨ Ready to start your move?",
      preview: `${g.title} — next: ${next.title}`,
      href: "/hub#moves",
      entityId: g.id,
    });
    nudged++;
  }
  return { scanned: goals.length, nudged };
}
