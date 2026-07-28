import { careers, type Career } from "@/data/careers";

/**
 * The careers a buyer can claim. Computer science is published free in full, so
 * it isn't part of the paid packs — everything else with a full profile is.
 */
export function claimableCareers(): Career[] {
  return careers.filter((c) => c.hasFullProfile && c.slug !== "computer-science");
}

export function isClaimable(slug: string): boolean {
  return claimableCareers().some((c) => c.slug === slug);
}
