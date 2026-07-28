/** Site-wide constants. Domain can be overridden via NEXT_PUBLIC_SITE_URL. */
export const SITE = {
  name: "Pivotum",
  tagline: "How exposed is your career to AI?",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pivotum.com",
} as const;
