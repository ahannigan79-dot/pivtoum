import "server-only";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { gymGenerated } from "@/db/schema";
import { GYM_LIST, type Scenario } from "@/lib/gym";

/**
 * The Gym catalogue, browsable by career. Pulls together the hand-authored
 * scenarios and the shared pool of generated reps (lib/gym-generate), so a member
 * can search for their field and work through everything available in it.
 */

export type CatCareer = { career: string; authored: number; generated: number; total: number };
export type CatalogueRep =
  | { kind: "authored"; slug: string; scenario: Scenario }
  | { kind: "generated"; id: string; scenario: Scenario };

/** Every career that has at least one rep, with counts — for the browse picker. */
export async function catalogueCareers(): Promise<CatCareer[]> {
  const authoredByCareer = new Map<string, number>();
  for (const s of GYM_LIST) authoredByCareer.set(s.career, (authoredByCareer.get(s.career) ?? 0) + 1);

  const genRows = await db
    .select({ career: gymGenerated.career, n: sql<number>`count(*)::int` })
    .from(gymGenerated)
    .groupBy(gymGenerated.career);
  const genByCareer = new Map<string, number>();
  for (const r of genRows) if (r.career) genByCareer.set(r.career, r.n);

  const names = new Set<string>([...authoredByCareer.keys(), ...genByCareer.keys()]);
  return [...names]
    .map((career) => {
      const authored = authoredByCareer.get(career) ?? 0;
      const generated = genByCareer.get(career) ?? 0;
      return { career, authored, generated, total: authored + generated };
    })
    .sort((a, b) => a.career.localeCompare(b.career));
}

/** All reps for a career — hand-authored first, then the generated pool (newest first). */
export async function catalogueForCareer(career: string): Promise<CatalogueRep[]> {
  const key = career.trim().toLowerCase();
  const authored: CatalogueRep[] = GYM_LIST
    .filter((s) => s.career.toLowerCase() === key)
    .map((s) => ({ kind: "authored", slug: s.slug, scenario: s }));

  const genRows = await db
    .select({ id: gymGenerated.id, scenario: gymGenerated.scenario })
    .from(gymGenerated)
    .where(sql`lower(${gymGenerated.career}) = ${key} or lower(${gymGenerated.lane}) = ${key}`)
    .orderBy(desc(gymGenerated.createdAt))
    .limit(60);
  const generated: CatalogueRep[] = genRows.map((r) => ({ kind: "generated", id: r.id, scenario: r.scenario as Scenario }));

  return [...authored, ...generated];
}
