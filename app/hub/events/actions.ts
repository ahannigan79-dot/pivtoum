"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";

export async function toggleRsvp(eventId: string) {
  const { userId } = await auth();
  if (!userId) return;
  const where = and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, userId));
  const existing = await db.select().from(eventRsvps).where(where).limit(1);
  if (existing[0]) await db.delete(eventRsvps).where(where);
  else await db.insert(eventRsvps).values({ eventId, memberId: userId, status: "going" });
  revalidatePath("/hub/events");
}

type EventType = "welcome_1to1" | "deep_dive" | "rescore" | "clinic" | "social";
const TYPES: EventType[] = ["welcome_1to1", "deep_dive", "rescore", "clinic", "social"];

export async function createEvent(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;

  const title = String(formData.get("title") ?? "").trim();
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  if (!title || !startsRaw) return;
  const startsAt = new Date(startsRaw);
  if (isNaN(startsAt.getTime())) return;

  const typeRaw = String(formData.get("type") ?? "deep_dive");
  const type = (TYPES as string[]).includes(typeRaw) ? (typeRaw as EventType) : "deep_dive";
  const durationMins = Number(formData.get("durationMins")) || 60;

  await db.insert(events).values({
    title: title.slice(0, 200),
    type,
    description: String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
    startsAt,
    durationMins,
    joinUrl: String(formData.get("joinUrl") ?? "").trim().slice(0, 500) || null,
  });
  revalidatePath("/hub/events");
}
