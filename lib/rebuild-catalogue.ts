import "server-only";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { rebuildGenerated } from "@/db/schema";
import { REBUILDS, type RebuildVariant } from "@/lib/rebuild";

/**
 * The Workflow Rebuild catalogue, browsable by career — the hand-authored
 * rebuilds plus the shared pool of generated ones (lib/rebuild-generate).
 */

export type CatCareer = { career: string; authored: number; generated: number; total: number };
export type CatalogueRebuild =
  | { kind: "authored"; careerSlug: string; slug: string; variant: RebuildVariant }
  | { kind: "generated"; id: string; variant: RebuildVariant };

const authoredCountByCareer = () => {
  const m = new Map<string, number>();
  for (const c of REBUILDS) m.set(c.career, c.lanes.reduce((n, l) => n + l.variants.length, 0));
  return m;
};

/** Careers that have at least one rebuild, with counts — for the browse picker. */
export async function catalogueCareers(): Promise<CatCareer[]> {
  const authored = authoredCountByCareer();
  const genRows = await db
    .select({ career: rebuildGenerated.career, n: sql<number>`count(*)::int` })
    .from(rebuildGenerated)
    .groupBy(rebuildGenerated.career);
  const gen = new Map<string, number>();
  for (const r of genRows) if (r.career) gen.set(r.career, r.n);

  const names = new Set<string>([...authored.keys(), ...gen.keys()]);
  return [...names]
    .map((career) => {
      const a = authored.get(career) ?? 0;
      const g = gen.get(career) ?? 0;
      return { career, authored: a, generated: g, total: a + g };
    })
    .sort((x, y) => x.career.localeCompare(y.career));
}

/** All rebuilds for a career — hand-authored first, then the generated pool. */
export async function catalogueForCareer(career: string): Promise<CatalogueRebuild[]> {
  const key = career.trim().toLowerCase();
  const authored: CatalogueRebuild[] = REBUILDS
    .filter((c) => c.career.toLowerCase() === key)
    .flatMap((c) => c.lanes.flatMap((l) => l.variants.map((v) => ({ kind: "authored" as const, careerSlug: c.slug, slug: v.slug, variant: v }))));

  const genRows = await db
    .select({ id: rebuildGenerated.id, variant: rebuildGenerated.variant })
    .from(rebuildGenerated)
    .where(sql`lower(${rebuildGenerated.career}) = ${key} or lower(${rebuildGenerated.lane}) = ${key}`)
    .orderBy(desc(rebuildGenerated.createdAt))
    .limit(60);
  const generated: CatalogueRebuild[] = genRows.map((r) => ({ kind: "generated", id: r.id, variant: r.variant as RebuildVariant }));

  return [...authored, ...generated];
}
