import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { glassHighlights } from "@/db/schema";

export type Highlight = { id: string; title: string; body: string; attribution: string | null; createdAt: Date };

/** Founder-curated highlights for the looking glass, newest first. */
export async function getHighlights(limit = 4): Promise<Highlight[]> {
  return db.select().from(glassHighlights).orderBy(desc(glassHighlights.createdAt)).limit(limit);
}

export async function addHighlight(title: string, body: string, attribution: string | null): Promise<void> {
  const t = title.trim(), b = body.trim();
  if (!t || !b) return;
  await db.insert(glassHighlights).values({
    title: t.slice(0, 160), body: b.slice(0, 600), attribution: attribution?.trim().slice(0, 120) || null,
  });
}

export async function deleteHighlight(id: string): Promise<void> {
  if (!id) return;
  await db.delete(glassHighlights).where(eq(glassHighlights.id, id));
}
