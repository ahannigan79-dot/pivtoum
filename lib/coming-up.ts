import "server-only";
import { getUpcomingEvents } from "@/lib/events";
import { getMyPods } from "@/lib/pods";
import { hasCheckedIn } from "@/lib/pod-ritual";

/* The "Coming up" rail — the handful of time-bound things a member should keep in
 * view on the dashboard: their next event, and their pod's week (check-in + the
 * streak they're protecting). The re-score countdown is derived on the page from
 * the trajectory it already holds. */

export type ComingEvent = { title: string; startsAt: Date; joinUrl: string | null };
export type ComingPod = { slug: string; name: string; crest: string | null; streakWeeks: number; checkedIn: boolean };
export type ComingUp = { nextEvent: ComingEvent | null; pod: ComingPod | null };

export async function getComingUp(userId: string | null): Promise<ComingUp> {
  if (!userId) return { nextEvent: null, pod: null };
  const [events, pods] = await Promise.all([getUpcomingEvents(userId), getMyPods(userId)]);
  const going = events.filter((e) => e.iGoing).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0] ?? null;
  const nextEvent: ComingEvent | null = going
    ? { title: going.title, startsAt: new Date(going.startsAt), joinUrl: going.joinUrl }
    : null;

  const p = pods[0] ?? null;
  const pod: ComingPod | null = p
    ? { slug: p.slug, name: p.name, crest: p.crest, streakWeeks: p.streakWeeks, checkedIn: await hasCheckedIn(p.id, userId) }
    : null;

  return { nextEvent, pod };
}
