/**
 * Google Ads (gtag.js) helpers. The tag only loads under the same advertising
 * consent rules as the Meta pixel (see lib/consent.ts + components/GoogleAds).
 *
 * The Ads ID is public. Conversion *labels* (the part after the slash in a
 * send_to like "AW-18367563898/AbCd...") come from env so they can be filled in
 * once the conversion actions exist; a conversion no-ops until its label is set.
 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-18367563898";
export const GADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL ?? "";
export const GADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GADS_PURCHASE_LABEL ?? "";

type ConversionParams = { value?: number; currency?: string };

/** Fire a Google Ads conversion. No-ops on the server, before gtag loads, or with no label. */
export function gtagConversion(label: string, params?: ConversionParams): void {
  if (typeof window === "undefined" || !label) return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}`, ...params });
  }
}
