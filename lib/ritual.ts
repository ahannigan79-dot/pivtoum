import { desc } from "drizzle-orm";
import { db } from "@/db";
import { weeklyPrompts } from "@/db/schema";

export type WeeklyPrompt = { id: string; title: string; body: string; createdAt: Date };

/** The current community prompt — the most recent one the founder set. */
export async function getCurrentPrompt(): Promise<WeeklyPrompt | null> {
  const r = await db.select().from(weeklyPrompts).orderBy(desc(weeklyPrompts.createdAt)).limit(1);
  return r[0] ?? null;
}

/** Founder sets a new prompt of the week (gate the caller). */
export async function setWeeklyPrompt(title: string, body: string): Promise<void> {
  const t = title.trim(), b = body.trim();
  if (!t || !b) return;
  await db.insert(weeklyPrompts).values({ title: t.slice(0, 160), body: b.slice(0, 1000) });
}
