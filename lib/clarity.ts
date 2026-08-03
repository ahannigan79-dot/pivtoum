/**
 * Microsoft Clarity (session replay + heatmaps). This is behavioural analytics
 * that sets cookies and records anonymised sessions, so it loads under the SAME
 * consent rules as the Meta pixel (see lib/consent.ts + components/Clarity).
 *
 * The live project id is baked in as the default, so no env var is needed. Set
 * NEXT_PUBLIC_CLARITY_ID only to OVERRIDE it (e.g. a separate test project); it
 * is public and inlined at build time, so a redeploy is required to take effect.
 * It still loads only after the visitor accepts (same consent gate as the pixel).
 */
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "xwqvux3bby";
