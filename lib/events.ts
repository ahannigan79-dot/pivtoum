import { and, asc, desc, eq, gte, inArray, isNull, lt, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps, pods, podMembers, profiles } from "@/db/schema";

type EventBase = typeof events.$inferSelect & { hostName: string | null; podName: string | null };
export type EventRow = EventBase & { goingCount: number; iGoing: boolean };

async function withRsvps(rows: EventBase[], meId: string | null): Promise<EventRow[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const rsvps = await db.select().from(eventRsvps).where(inArray(eventRsvps.eventId, ids));
  const count = new Map<string, number>();
  const mine = new Set<string>();
  for (const r of rsvps) {
    if (r.status === "going") {
      count.set(r.eventId, (count.get(r.eventId) ?? 0) + 1);
      if (meId && r.memberId === meId) mine.add(r.eventId);
    }
  }
  return rows.map((e) => ({ ...e, goingCount: count.get(e.id) ?? 0, iGoing: mine.has(e.id) }));
}

/** Pod ids the member belongs to — used to show pod-scoped events only to their pod. */
async function myPodIds(meId: string | null): Promise<string[]> {
  if (!meId) return [];
  const rows = await db.select({ podId: podMembers.podId }).from(podMembers).where(eq(podMembers.memberId, meId));
  return rows.map((r) => r.podId);
}

/** Community events (no pod) plus events for pods the member is in. */
function visibleTo(mine: string[]): SQL | undefined {
  return mine.length ? or(isNull(events.podId), inArray(events.podId, mine)) : isNull(events.podId);
}

function selectEvents() {
  return db.select({
    e: events,
    hostName: profiles.displayName,
    podName: pods.name,
  }).from(events)
    .leftJoin(profiles, eq(events.hostId, profiles.clerkUserId))
    .leftJoin(pods, eq(events.podId, pods.id));
}
const shape = (r: { e: typeof events.$inferSelect; hostName: string | null; podName: string | null }): EventBase =>
  ({ ...r.e, hostName: r.hostName, podName: r.podName });

export async function getUpcomingEvents(meId: string | null): Promise<EventRow[]> {
  const mine = await myPodIds(meId);
  const rows = await selectEvents()
    .where(and(gte(events.startsAt, new Date()), visibleTo(mine)))
    .orderBy(asc(events.startsAt)).limit(30);
  return withRsvps(rows.map(shape), meId);
}

export async function getPastEvents(meId: string | null): Promise<EventRow[]> {
  const mine = await myPodIds(meId);
  const rows = await selectEvents()
    .where(and(lt(events.startsAt, new Date()), visibleTo(mine)))
    .orderBy(desc(events.startsAt)).limit(12);
  return withRsvps(rows.map(shape), meId);
}

export const EVENT_LABELS: Record<string, string> = {
  welcome_1to1: "1:1 Welcome",
  deep_dive: "Deep-dive week",
  rescore: "Re-score",
  clinic: "Clinic",
  social: "Social",
  q_and_a: "Q&A",
  open_stage: "Open Stage",
  sme: "SME session",
  wins: "Celebrate the Wins",
  pod_checkin: "Pod check-in",
};

export function formatWhen(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return t.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatTime(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Events that start within a given month (local time). */
export async function getEventsInMonth(meId: string | null, year: number, month0: number): Promise<EventRow[]> {
  const start = new Date(year, month0, 1);
  const end = new Date(year, month0 + 1, 1);
  const mine = await myPodIds(meId);
  const rows = await selectEvents()
    .where(and(gte(events.startsAt, start), lt(events.startsAt, end), visibleTo(mine)))
    .orderBy(asc(events.startsAt)).limit(200);
  return withRsvps(rows.map(shape), meId);
}

export type CalDay = { date: Date; day: number; inMonth: boolean; isToday: boolean };

/** A 6×7 matrix of days covering the month, weeks starting Sunday. */
export function monthMatrix(year: number, month0: number): CalDay[] {
  const first = new Date(year, month0, 1);
  const start = new Date(year, month0, 1 - first.getDay()); // back up to the Sunday
  const today = new Date();
  const todayKey = today.toDateString();
  const cells: CalDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, day: d.getDate(), inMonth: d.getMonth() === month0, isToday: d.toDateString() === todayKey });
  }
  return cells;
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
