/** Site-wide constants. Domain can be overridden via NEXT_PUBLIC_SITE_URL. */
export const SITE = {
  name: "Pivotum",
  tagline: "How exposed is your career to AI?",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pivotum.ai",
} as const;

/** The current edition. Bump this when a new edition publishes. */
export const EDITION = "Fall 2026";
