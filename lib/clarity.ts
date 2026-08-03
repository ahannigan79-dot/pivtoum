/**
 * Microsoft Clarity (session replay + heatmaps). This is behavioural analytics
 * that sets cookies and records anonymised sessions, so it loads under the SAME
 * consent rules as the Meta pixel (see lib/consent.ts + components/Clarity).
 *
 * The project id is public but account-specific, so — unlike the pixel — it has
 * no baked default. Set NEXT_PUBLIC_CLARITY_ID to switch Clarity on; while it is
 * empty, Clarity never loads and nothing about the site changes.
 */
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";
