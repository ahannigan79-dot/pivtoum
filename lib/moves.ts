import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { commitments } from "@/db/schema";
import type { MapComputed } from "@/lib/trajectory";

/* Moves = the member's commitments against a lever. This is the actioning layer
 * of Evolve: turn the Map's winning move into concrete work, ship it, watch the
 * trajectory bend. */

export type Lever = { slug: string; label: string; edge: 1 | 2 | 0 };

export const LEVERS: Lever[] = [
  { slug: "renovate", label: "◆ Master the machine", edge: 1 },
  { slug: "guard", label: "✦ Guard the moat", edge: 2 },
  { slug: "shift", label: "✦ Shift lanes", edge: 2 },
  { slug: "relocate", label: "✦ Relocate", edge: 2 },
  { slug: "judgment", label: "Deepen judgment", edge: 2 },
  { slug: "trust", label: "Deepen trust & relationships", edge: 2 },
  { slug: "physical", label: "Hands-on work", edge: 2 },
  { slug: "licensing", label: "Credential / licensing", edge: 2 },
];

export const LEVER_BY_SLUG: Record<string, Lever> = Object.fromEntries(LEVERS.map((l) => [l.slug, l]));
export function leverLabel(slug: string): string {
  return LEVER_BY_SLUG[slug]?.label ?? slug;
}

export type Move = {
  id: string; title: string; lever: string; leverLabel: string;
  status: string; dueAt: Date | null; completedAt: Date | null; createdAt: Date;
};

export type Suggestion = { title: string; lever: string };

function toMove(r: typeof commitments.$inferSelect): Move {
  return {
    id: r.id, title: r.title, lever: r.lever, leverLabel: leverLabel(r.lever),
    status: r.status, dueAt: r.dueAt, completedAt: r.completedAt, createdAt: r.createdAt,
  };
}

export async function getMoves(userId: string | null): Promise<{ active: Move[]; shipped: Move[] }> {
  if (!userId) return { active: [], shipped: [] };
  const rows = await db
    .select().from(commitments)
    .where(and(eq(commitments.memberId, userId), ne(commitments.status, "dropped")))
    .orderBy(desc(commitments.createdAt));
  return {
    active: rows.filter((r) => r.status === "active").map(toMove),
    shipped: rows.filter((r) => r.status === "done").sort((a, b) =>
      (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)).map(toMove),
  };
}

/** Seed suggestions from the member's Map — the concrete first moves their result implies. */
export function suggestMoves(c: MapComputed | null): Suggestion[] {
  if (!c) return [];
  const out: Suggestion[] = [];
  const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();

  // Edge 1 — always renovate: the driver's own action line.
  const action = strip(c.driver?.action);
  if (action) out.push({ title: action, lever: "renovate" });

  // Edge 2 — from the prescribed second move.
  const e2 = c.move?.edge2;
  const e2short = strip(c.move?.e2short);
  if (e2 && LEVER_BY_SLUG[e2]) {
    out.push({ title: e2short || LEVER_BY_SLUG[e2].label.replace(/^✦\s*/, ""), lever: e2 });
  }

  // Deepen what AI can't take — from the driver's "down".
  const down = strip(c.driver?.down);
  if (down) out.push({ title: `Move hours toward: ${down}`, lever: "judgment" });

  return out.slice(0, 3);
}
