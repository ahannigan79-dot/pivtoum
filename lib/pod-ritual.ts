/* ============================================================================
   The weekly pod ritual (Phase 1d) — the heartbeat that makes a pod feel alive.
     Mon  postWeeklyMove()      — drop "this week's team move" into each pod
     Thu  nudgeMissingCheckins()— "your pod is waiting" to anyone who hasn't
     Sun  closePodWeek()        — tally participation, move the streak, post wrap
   A member's check-in is recorded by recordCheckin() (via a server action).
   Server-independent so the cron can drive it. Streak bar: ≥60% active.
   ============================================================================ */
import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pods, podMembers, podCheckins, podWeeks, posts, profiles } from "@/db/schema";
import { isoWeekKey } from "@/lib/gym-gate";
import { activeCadenceMonth } from "@/lib/cadence-state";
import { weekOfMonth, promptForWeek } from "@/lib/cadence";
import { getPodThreads } from "@/lib/threads";
import { seedAuthor } from "@/lib/seed-content";
import { notifyPod } from "@/lib/notifications";

export const STREAK_BAR = 0.6; // ≥60% of the pod active in a week clears the streak

function isoWeekStart(d = new Date()): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon = 0
  date.setUTCDate(date.getUTCDate() - dayNum);
  return date;
}

/** The pod's check-in thread id (core threads are lazily created if missing). */
async function checkinThreadId(podId: string): Promise<string | null> {
  const threads = await getPodThreads(podId);
  return (threads.find((t) => t.slug === "check-in") ?? threads[0])?.id ?? null;
}

/** Real (non-helper) members of a pod. */
async function realMembers(podId: string): Promise<string[]> {
  const rows = await db.select({ id: podMembers.memberId }).from(podMembers)
    .where(sql`${podMembers.podId} = ${podId} and ${podMembers.auto} = false`);
  return rows.map((r) => r.id);
}

/** Members who have checked in this ISO week. */
async function checkedInThisWeek(podId: string, week: string): Promise<Set<string>> {
  const rows = await db.select({ id: podCheckins.memberId }).from(podCheckins)
    .where(sql`${podCheckins.podId} = ${podId} and ${podCheckins.isoWeek} = ${week}`);
  return new Set(rows.map((r) => r.id));
}

/* ---- member check-in (called by the submitCheckin server action) ---------- */
export type CheckinInput = { shipped?: string | null; stuck?: string | null; move?: string | null };

export async function recordCheckin(userId: string, podId: string, input: CheckinInput): Promise<void> {
  const week = isoWeekKey();
  const shipped = input.shipped?.trim().slice(0, 500) || null;
  const stuck = input.stuck?.trim().slice(0, 500) || null;
  const move = input.move?.trim().slice(0, 500) || null;

  const existing = await db.select({ id: podCheckins.id }).from(podCheckins)
    .where(sql`${podCheckins.podId} = ${podId} and ${podCheckins.memberId} = ${userId} and ${podCheckins.isoWeek} = ${week}`)
    .limit(1);

  if (existing.length) {
    await db.update(podCheckins).set({ shipped, stuck, move }).where(eq(podCheckins.id, existing[0].id));
    return; // editing this week's check-in — don't post a duplicate
  }

  await db.insert(podCheckins).values({ podId, memberId: userId, isoWeek: week, shipped, stuck, move });
  const threadId = await checkinThreadId(podId);
  const body =
    `Check-in — ${week}\n\n` +
    `✅ Shipped: ${shipped ?? "—"}\n` +
    `🧱 Stuck: ${stuck ?? "—"}\n` +
    `➡️ This week: ${move ?? "—"}`;
  await db.insert(posts).values({ authorId: userId, podId, threadId, body });
}

export async function hasCheckedIn(podId: string, userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const r = await db.select({ id: podCheckins.id }).from(podCheckins)
    .where(sql`${podCheckins.podId} = ${podId} and ${podCheckins.memberId} = ${userId} and ${podCheckins.isoWeek} = ${isoWeekKey()}`)
    .limit(1);
  return r.length > 0;
}

/* ---- Monday: the team move ------------------------------------------------ */
export async function postWeeklyMove(now = new Date()): Promise<{ posted: number }> {
  const author = await seedAuthor();
  if (!author) return { posted: 0 };
  const month = await activeCadenceMonth();
  const week = weekOfMonth(now);
  const prompt = promptForWeek(month, week);
  const weekStart = isoWeekStart(now);
  const title = `Week ${week}: ${month.tag ?? month.subject}`;
  const body =
    `📅 This week's team move — ${month.subject}\n\n${prompt}\n\n` +
    `Drop your check-in below: what you shipped, where you're stuck, and your one move this week.`;

  const all = await db.select({ id: pods.id }).from(pods);
  let posted = 0;
  for (const p of all) {
    const threadId = await checkinThreadId(p.id);
    if (!threadId) continue;
    // Idempotent: skip if this week's move already posted in the pod.
    const dup = await db.select({ id: posts.id }).from(posts)
      .where(sql`${posts.podId} = ${p.id} and ${posts.threadId} = ${threadId}
        and ${posts.authorId} = ${author} and ${posts.title} like 'Week %'
        and ${posts.createdAt} >= ${weekStart}`).limit(1);
    if (dup.length) continue;
    await db.insert(posts).values({ authorId: author, podId: p.id, threadId, title, body });
    posted++;
  }
  return { posted };
}

/* ---- Thursday: nudge the members who haven't checked in ------------------- */
export async function nudgeMissingCheckins(): Promise<{ nudged: number }> {
  const week = isoWeekKey();
  const all = await db.select({ id: pods.id, slug: pods.slug }).from(pods);
  let nudged = 0;
  for (const p of all) {
    const members = await realMembers(p.id);
    if (members.length < 2) continue; // don't nag a solo/near-empty pod
    const done = await checkedInThisWeek(p.id, week);
    for (const m of members) {
      if (done.has(m)) continue;
      await notifyPod(m, {
        title: "Your pod is waiting",
        preview: "Drop your 2-minute check-in — keep the streak alive.",
        href: `/hub/pods/${p.slug}?t=check-in`, entityId: `checkin:${week}`,
      });
      nudged++;
    }
  }
  return { nudged };
}

/* ---- Sunday: close the week, move the streak, post the wrap ---------------- */
export async function closePodWeek(now = new Date()): Promise<{ closed: number }> {
  const week = isoWeekKey(now);
  const author = await seedAuthor();
  const all = await db.select({ id: pods.id, streakWeeks: pods.streakWeeks }).from(pods);
  let closed = 0;

  for (const p of all) {
    // Idempotent: skip a pod already closed for this week.
    const done = await db.select({ id: podWeeks.id }).from(podWeeks)
      .where(sql`${podWeeks.podId} = ${p.id} and ${podWeeks.isoWeek} = ${week}`).limit(1);
    if (done.length) continue;

    const members = await realMembers(p.id);
    const size = members.length;
    if (size === 0) continue;
    const active = (await checkedInThisWeek(p.id, week)).size;
    const hit = size > 0 && active / size >= STREAK_BAR;

    await db.insert(podWeeks).values({ podId: p.id, isoWeek: week, activeCount: active, size, hit });
    const nextStreak = hit ? (p.streakWeeks ?? 0) + 1 : 0;
    await db.update(pods).set({ streakWeeks: nextStreak }).where(eq(pods.id, p.id));

    if (author) {
      const pct = Math.round((active / size) * 100);
      const threadId = await checkinThreadId(p.id);
      const body = hit
        ? `🏁 Week wrap — ${active}/${size} checked in (${pct}%). Streak: ${nextStreak} week${nextStreak === 1 ? "" : "s"} 🔥 Keep it going.`
        : `🏁 Week wrap — ${active}/${size} checked in (${pct}%). Streak reset — let's get everyone in next week.`;
      await db.insert(posts).values({ authorId: author, podId: p.id, threadId, body });
    }
    closed++;
  }
  return { closed };
}

/* ---- the daily dispatcher (one cron) -------------------------------------- */
export async function runPodWeek(now = new Date(), force?: "move" | "nudge" | "close") {
  const dow = now.getUTCDay(); // 0 Sun … 6 Sat
  if (force === "move" || (!force && dow === 1)) return { ran: "move", ...(await postWeeklyMove(now)) };
  if (force === "nudge" || (!force && dow === 4)) return { ran: "nudge", ...(await nudgeMissingCheckins()) };
  if (force === "close" || (!force && dow === 0)) return { ran: "close", ...(await closePodWeek(now)) };
  return { ran: "none" };
}
