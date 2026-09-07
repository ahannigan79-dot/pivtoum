"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { generateNewsletterDraft, saveDraftIssue, sendIssue, type SendResult } from "@/lib/newsletter";

async function requireFounder(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const profile = await getOrCreateProfile();
  return isFounder(profile) ? userId : null;
}

/** Draft this month's newsletter from the scout roll-up (does not persist). */
export async function draftNewsletterAction(): Promise<{ ok: boolean; subject?: string; body?: string }> {
  if (!(await requireFounder())) return { ok: false };
  const d = await generateNewsletterDraft();
  return d ? { ok: true, subject: d.subject, body: d.body } : { ok: false };
}

/** Save the working draft. */
export async function saveNewsletterAction(subject: string, body: string): Promise<{ ok: boolean }> {
  const userId = await requireFounder();
  if (!userId) return { ok: false };
  const s = subject.trim().slice(0, 120), b = body.trim();
  if (!s || !b) return { ok: false };
  await saveDraftIssue(userId, s, b);
  revalidatePath("/hub/newsletter");
  return { ok: true };
}

/** Persist the latest edits, then send to every opted-in member. */
export async function sendNewsletterAction(subject: string, body: string): Promise<SendResult> {
  const userId = await requireFounder();
  if (!userId) return { ok: false, reason: "forbidden" };
  const s = subject.trim().slice(0, 120), b = body.trim();
  if (!s || !b) return { ok: false, reason: "empty" };
  const id = await saveDraftIssue(userId, s, b);
  const res = await sendIssue(id);
  revalidatePath("/hub/newsletter");
  return res;
}
