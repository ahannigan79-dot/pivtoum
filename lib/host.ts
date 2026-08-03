import { SITE } from "@/lib/site";

/** Canonical production hostname derived from the configured site URL. */
const CANONICAL_HOST = (() => {
  try {
    return new URL(SITE.url).hostname;
  } catch {
    return "pivotum.ai";
  }
})();

/**
 * True only on the canonical production host (and its www alias). Preview
 * deployments (*.vercel.app), staging subdomains, and localhost all return
 * false, so analytics/ads/replay tags never fire outside production — keeping
 * your own preview testing and Vercel's build bots out of Clarity, the Meta
 * pixel dataset, and Google Ads. Client-only; returns false during SSR.
 */
export function isProductionHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
}
