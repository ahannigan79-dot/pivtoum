import type { MapComputed } from "@/lib/trajectory";

/* Win-strategy labels for pods. As the community grows, members can align to a
 * pod matched to their move — Grow, Defend, or Pivot — or an "All" pod that
 * mixes every strategy. Experience levels are deliberately NOT a matching axis:
 * mixing seniority is how people learn off each other. */

export type Strategy = "all" | "grow" | "defend" | "pivot";

export const STRATEGIES: { key: Strategy; label: string; blurb: string; crest: string }[] = [
  { key: "all",    label: "All strategies", blurb: "A mix — everyone facing the shift, whatever their move.", crest: "◆" },
  { key: "grow",   label: "Grow",   blurb: "Get ahead — go AI-native and climb from a position of strength.", crest: "▲" },
  { key: "defend", label: "Defend", blurb: "Protect your moat — deepen the judgment and trust AI can't take.", crest: "✦" },
  { key: "pivot",  label: "Pivot",  blurb: "Reposition — move toward more AI-resilient or protected ground.", crest: "➜" },
];

const BY_KEY: Record<string, (typeof STRATEGIES)[number]> = Object.fromEntries(STRATEGIES.map((s) => [s.key, s]));

export function strategyMeta(key: string | null | undefined) {
  return BY_KEY[(key ?? "all")] ?? BY_KEY.all;
}
export function strategyLabel(key: string | null | undefined): string {
  return strategyMeta(key).label;
}

/** The win-strategy a member's Map points to, from their edge-2 move. Everyone
 *  who isn't guarding/repositioning is growing (mastering + advancing). */
export function strategyFromComputed(c: MapComputed | null | undefined): Strategy {
  const e2 = c?.move?.edge2;
  if (e2 === "guard") return "defend";
  if (e2 === "shift" || e2 === "relocate") return "pivot";
  return "grow";
}
