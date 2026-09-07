import "server-only";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps, mapStates, notifications } from "@/db/schema";
import { notify } from "@/lib/notifications";
import { PERSONAL_RESCORE_DAYS } from "@/lib/trajectory";
import { formatWhen } from "@/lib/events";

/* Phone reminders (push): two time-bound nudges the dashboard shows but that
 * otherwise need chasing — an RSVP'd event starting soon, and a Map re-score
 * that's come due. Runs daily, deduped so nobody gets the same nudge twice.
 * (Pod check-in already pushes from the pod-week cron.) */

const DAY = 86400000;
const EVENT_WINDOW_MS = DAY;          // remind about events starting within 24h
const RESCORE_COOLDOWN_MS = 14 * DAY; // once due, nudge at most this often

/** Events an RSVP'd member should be reminded about, starting within the window. */
async function remindEvents(now: Date): Promise<number> {
  const soon = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt, joinUrl: events.joinUrl })
    .from(events)
    .where(and(gte(events.startsAt, now), lt(events.startsAt, new Date(now.getTime() + EVENT_WINDOW_MS))));
  if (!soon.length) return 0;

  const ids = soon.map((e) => e.id);
  const [rsvps, already] = await Promise.all([
    db.select({ eventId: eventRsvps.eventId, memberId: eventRsvps.memberId })
      .from(eventRsvps).where(and(inArray(eventRsvps.eventId, ids), eq(eventRsvps.status, "going"))),
    // Already-reminded pairs (event reminders are one-shot, so check all time).
    db.select({ member: notifications.memberId, ent: sql<string>`${notifications.payload}->>'entityId'` })
      .from(notifications).where(and(
        eq(notifications.type, "event"),
        inArray(sql`${notifications.payload}->>'entityId'`, ids.map((id) => `eventsoon:${id}`)),
      )),
  ]);
  const sent = new Set(already.map((r) => `${r.member}|${r.ent}`));
  const byId = new Map(soon.map((e) => [e.id, e]));

  let n = 0;
  for (const r of rsvps) {
    const ent = `eventsoon:${r.eventId}`;
    if (sent.has(`${r.memberId}|${ent}`)) continue;
    const e = byId.get(r.eventId);
    if (!e) continue;
    await notify(r.memberId, "event", {
      title: `Starting soon: ${e.title}`,
      preview: `${formatWhen(e.startsAt)}${e.joinUrl ? " — tap to join" : ""}`,
      href: e.joinUrl || "/hub/events",
      entityId: ent,
    });
    n++;
  }
  return n;
}

/** Members whose personal Map re-score (every 2 months) has come due. */
async function remindRescores(now: Date): Promise<number> {
  const latest = await db.select({ memberId: mapStates.memberId, last: sql<Date>`max(${mapStates.createdAt})` })
    .from(mapStates).groupBy(mapStates.memberId);
  const dueBefore = new Date(now.getTime() - PERSONAL_RESCORE_DAYS * DAY);
  const due = latest.filter((r) => r.last && new Date(r.last) <= dueBefore);
  if (!due.length) return 0;

  // Skip anyone nudged inside the cooldown window.
  const recent = await db.select({ member: notifications.memberId, ent: sql<string>`${notifications.payload}->>'entityId'` })
    .from(notifications).where(and(
      eq(notifications.type, "rescore"),
      sql`${notifications.createdAt} > ${new Date(now.getTime() - RESCORE_COOLDOWN_MS)}`,
    ));
  const cooled = new Set(recent.map((r) => r.ent).filter((e) => e?.startsWith("rescoredue:")));

  let n = 0;
  for (const r of due) {
    const ent = `rescoredue:${r.memberId}`;
    if (cooled.has(ent)) continue;
    await notify(r.memberId, "rescore", {
      title: "Time to re-score your Map",
      preview: "It's been two months — re-score to see how your protections and effort have moved your exposure.",
      href: "/hub/map",
      entityId: ent,
    });
    n++;
  }
  return n;
}

export async function runReminders(now: Date = new Date()): Promise<{ events: number; rescores: number }> {
  const [ev, rs] = await Promise.all([remindEvents(now), remindRescores(now)]);
  return { events: ev, rescores: rs };
}
