import { and, asc, desc, gte, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";

export type EventRow = typeof events.$inferSelect & { goingCount: number; iGoing: boolean };

async function withRsvps(rows: (typeof events.$inferSelect)[], meId: string | null): Promise<EventRow[]> {
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

export async function getUpcomingEvents(meId: string | null): Promise<EventRow[]> {
  const rows = await db.select().from(events)
    .where(gte(events.startsAt, new Date()))
    .orderBy(asc(events.startsAt)).limit(30);
  return withRsvps(rows, meId);
}

export async function getPastEvents(meId: string | null): Promise<EventRow[]> {
  const rows = await db.select().from(events)
    .where(lt(events.startsAt, new Date()))
    .orderBy(desc(events.startsAt)).limit(12);
  return withRsvps(rows, meId);
}

export const EVENT_LABELS: Record<string, string> = {
  welcome_1to1: "1:1 Welcome",
  deep_dive: "Deep-dive week",
  rescore: "Re-score",
  clinic: "Clinic",
  social: "Social",
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
  const rows = await db.select().from(events)
    .where(and(gte(events.startsAt, start), lt(events.startsAt, end)))
    .orderBy(asc(events.startsAt)).limit(200);
  return withRsvps(rows, meId);
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
