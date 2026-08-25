import "server-only";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { rebuildGenerated } from "@/db/schema";
import { careers } from "@/data/careers";
import { createGeneratedRebuild } from "@/lib/rebuild-generate";
import { aiConfigured } from "@/lib/ai";

/** Pre-seed the shared Workflow Rebuild catalogue — 2 per career, in bounded
 *  batches (caller loops until `done`). Idempotent; reps stored unowned. */
export type SeedResult = { seeded: string[]; filled: number; remaining: number; total: number; done: boolean };

export async function seedRebuildCatalogue(target = 2, maxCareers = 1): Promise<SeedResult> {
  if (!aiConfigured()) return { seeded: [], filled: 0, remaining: 0, total: careers.length, done: true };

  const rows = await db
    .select({ career: rebuildGenerated.career, n: sql<number>`count(*)::int` })
    .from(rebuildGenerated)
    .groupBy(rebuildGenerated.career);
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
      const id = await createGeneratedRebuild(null, c.name, c.name); // unowned catalogue rebuild
      if (!id) { ok = false; break; }
    }
    if (ok) { filled++; seeded.push(c.name); }
  }

  const remaining = needing.length - filled;
  return { seeded, filled, remaining, total: careers.length, done: remaining <= 0 };
}

/** Remove the unowned catalogue seeds (leaves member-generated rebuilds intact). */
export async function clearRebuildCatalogue(): Promise<number> {
  const rows = await db.delete(rebuildGenerated).where(isNull(rebuildGenerated.memberId)).returning({ id: rebuildGenerated.id });
  return rows.length;
}
