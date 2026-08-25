import "server-only";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { gymGenerated } from "@/db/schema";
import { careers } from "@/data/careers";
import { createGeneratedRep } from "@/lib/gym-generate";
import { aiConfigured } from "@/lib/ai";

/**
 * Pre-seed the shared Gym catalogue so every career has reps waiting (the first
 * member in a lane gets an instant rep). Runs in bounded batches so each call
 * fits the serverless timeout; the caller loops until `done`. Idempotent — only
 * tops up careers below the target, and reps are stored unowned (memberId null).
 */
export type SeedResult = { seeded: string[]; filled: number; remaining: number; total: number; done: boolean };

export async function seedGymCatalogue(target = 2, maxCareers = 1): Promise<SeedResult> {
  if (!aiConfigured()) return { seeded: [], filled: 0, remaining: 0, total: careers.length, done: true };

  const rows = await db
    .select({ career: gymGenerated.career, n: sql<number>`count(*)::int` })
    .from(gymGenerated)
    .groupBy(gymGenerated.career);
  const count = new Map<string, number>();
  for (const r of rows) if (r.career) count.set(r.career.toLowerCase(), r.n);

  const needing = careers.filter((c) => (count.get(c.name.toLowerCase()) ?? 0) < target);
  const batch = needing.slice(0, maxCareers);

  let filled = 0;
  const seeded: string[] = [];
  for (const c of batch) {
    const have = count.get(c.name.toLowerCase()) ?? 0;
    let ok = true;
    for (let k = have; k < target; k++) {
      const id = await createGeneratedRep(null, c.name, c.name); // unowned catalogue rep
      if (!id) { ok = false; break; }
    }
    if (ok) { filled++; seeded.push(c.name); }
  }

  const remaining = needing.length - filled;
  return { seeded, filled, remaining, total: careers.length, done: remaining <= 0 };
}

/** Remove the unowned catalogue seeds (leaves member-generated reps intact). */
export async function clearGymCatalogue(): Promise<number> {
  const rows = await db.delete(gymGenerated).where(isNull(gymGenerated.memberId)).returning({ id: gymGenerated.id });
  return rows.length;
}
