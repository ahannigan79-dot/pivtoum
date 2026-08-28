import { careers, careerRange } from "@/data/careers";
import { scoreTier } from "@/lib/tier";
import { hasSamplerPage } from "@/content/careers/registry";
import type { IndexRow } from "@/components/CareerIndex";

/**
 * Minimal, serialisable, risk-sorted rows for the interactive career index.
 * Shared by the parent homepage and the "your career" (worried-adult) page so
 * the two never drift apart.
 */
export function buildIndexRows(): IndexRow[] {
  return careers
    .map((c) => ({ c, ...careerRange(c) }))
    .sort((a, b) => a.safest - b.safest || a.exposed - b.exposed)
    .map(({ c, safest, exposed }) => {
      const isFreeProfile = c.slug === "computer-science";
      return {
        slug: c.slug,
        name: c.name,
        safest,
        exposed,
        loSafe: scoreTier(safest) === "safe",
        hiExposed: scoreTier(exposed) === "exposed",
        isLink: hasSamplerPage(c.slug) || isFreeProfile,
        goLabel: isFreeProfile ? "Free profile" : "Exposure Report",
      };
    });
}
