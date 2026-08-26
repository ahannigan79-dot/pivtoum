"use server";
import { revalidatePath } from "next/cache";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { CURRICULUM, MONTH_BY_KEY, activeMonth } from "@/lib/cadence";
import { setPin, markScheduled, getCadenceState } from "@/lib/cadence-state";

/** Founder: pin the active month, clear the pin, or step the pin forward/back. */
export async function setCadence(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const op = String(formData.get("op") ?? "");

  if (op === "clear") { await setPin(null, profile?.clerkUserId); }
  else if (op === "pin") {
    const key = String(formData.get("key") ?? "");
    if (MONTH_BY_KEY[key]) await setPin(key, profile?.clerkUserId);
  } else if (op === "advance" || op === "back") {
    const { pinnedKey } = await getCadenceState();
    const current = activeMonth(pinnedKey);
    const delta = op === "advance" ? 1 : -1;
    const nextOrder = ((current.order - 1 + delta + 12) % 12) + 1;
    const next = CURRICULUM.find((m) => m.order === nextOrder);
    if (next) await setPin(next.key, profile?.clerkUserId);
  }
  revalidatePath("/hub/cadence");
}

/** Founder: schedule this month's flagship events from the curriculum template.
 *  Anchors each event to its week of the current calendar month. Idempotent —
 *  skips any event whose title already exists in the month. */
export async function scheduleCadenceEvents() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;
  const { pinnedKey } = await getCadenceState();
  const m = activeMonth(pinnedKey);

  const now = new Date();
  const year = now.getFullYear();
  const mon = now.getMonth();
  const monStart = new Date(year, mon, 1);
  const monEnd = new Date(year, mon + 1, 1);

  const existing = await db.select({ title: events.title }).from(events)
    .where(and(gte(events.startsAt, monStart), lt(events.startsAt, monEnd)));
  const have = new Set(existing.map((e) => e.title));

  const toInsert = m.events
    .filter((ev) => !have.has(ev.title))
    .map((ev) => {
      // week (1–4) → a Thursday-ish weekday of that week, noon local
      const day = Math.min(28, (ev.when - 1) * 7 + 4);
      const startsAt = new Date(year, mon, day, 12, 0, 0);
      return {
        title: ev.title.slice(0, 200),
        type: ev.type as typeof events.$inferInsert.type,
        description: ev.desc ?? null,
        startsAt,
        durationMins: 60,
        hostId: profile?.clerkUserId ?? null,
      };
    });

  if (toInsert.length) await db.insert(events).values(toInsert);
  await markScheduled(m.key, profile?.clerkUserId);
  revalidatePath("/hub/cadence");
  revalidatePath("/hub/events");
}
