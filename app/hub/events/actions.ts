"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { leadsPod } from "@/lib/pods";

export async function toggleRsvp(eventId: string) {
  const { userId } = await auth();
  if (!userId) return;
  const where = and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, userId));
  const existing = await db.select().from(eventRsvps).where(where).limit(1);
  if (existing[0]) await db.delete(eventRsvps).where(where);
  else await db.insert(eventRsvps).values({ eventId, memberId: userId, status: "going" });
  revalidatePath("/hub/events");
}

type EventType =
  | "welcome_1to1" | "deep_dive" | "rescore" | "clinic" | "social"
  | "q_and_a" | "open_stage" | "sme" | "wins" | "pod_checkin";
const TYPES: EventType[] = [
  "welcome_1to1", "deep_dive", "rescore", "clinic", "social",
  "q_and_a", "open_stage", "sme", "wins", "pod_checkin",
];
/** Session types a pod leader may host. */
const POD_TYPES: EventType[] = ["pod_checkin", "sme", "open_stage", "wins"];

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
    recordingUrl: String(formData.get("recordingUrl") ?? "").trim().slice(0, 500) || null,
    hostId: profile?.clerkUserId ?? null,
  });
  revalidatePath("/hub/events");
}

/** A pod leader hosts a session for a pod they lead. Pod-scoped, hosted by them. */
export async function hostSession(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const podId = String(formData.get("podId") ?? "").trim();
  if (!podId || !(await leadsPod(userId, podId))) return;

  const title = String(formData.get("title") ?? "").trim();
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  if (!title || !startsRaw) return;
  const startsAt = new Date(startsRaw);
  if (isNaN(startsAt.getTime())) return;

  const typeRaw = String(formData.get("type") ?? "pod_checkin");
  const type = (POD_TYPES as string[]).includes(typeRaw) ? (typeRaw as EventType) : "pod_checkin";
  const scope = String(formData.get("scope") ?? "pod"); // "pod" (their pod only) or "community"

  await db.insert(events).values({
    title: title.slice(0, 200),
    type,
    description: String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
    startsAt,
    durationMins: Number(formData.get("durationMins")) || 45,
    joinUrl: String(formData.get("joinUrl") ?? "").trim().slice(0, 500) || null,
    hostId: userId,
    podId: scope === "community" ? null : podId, // open to the whole room, or keep it to the pod
  });
  revalidatePath("/hub/events");
}

/** Founder: edit an existing event. */
export async function updateEvent(eventId: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return;

  const title = String(formData.get("title") ?? "").trim();
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  if (!eventId || !title || !startsRaw) return;
  const startsAt = new Date(startsRaw);
  if (isNaN(startsAt.getTime())) return;

  const typeRaw = String(formData.get("type") ?? "deep_dive");
  const type = (TYPES as string[]).includes(typeRaw) ? (typeRaw as EventType) : "deep_dive";
  const durationMins = Number(formData.get("durationMins")) || 60;

  await db.update(events).set({
    title: title.slice(0, 200),
    type,
    description: String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
    startsAt,
    durationMins,
    joinUrl: String(formData.get("joinUrl") ?? "").trim().slice(0, 500) || null,
    recordingUrl: String(formData.get("recordingUrl") ?? "").trim().slice(0, 500) || null,
  }).where(eq(events.id, eventId));
  revalidatePath("/hub/events");
}

/** Founder: delete an event (RSVPs cascade). */
export async function deleteEvent(eventId: string) {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile) || !eventId) return;
  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/hub/events");
}
