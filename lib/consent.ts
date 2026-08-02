/**
 * Advertising-consent state for the Meta pixel, with a regional model:
 *
 * - EU / EEA / UK / Switzerland ("eu"): opt-in. The pixel loads only after the
 *   visitor accepts; a banner asks on first visit.
 * - Everywhere else ("open"): opt-out. The pixel loads by default, but we honour
 *   Global Privacy Control and an explicit decline.
 *
 * The region is set as a cookie by middleware from the edge geo header. Consent
 * choice is stored in a first-party cookie so "clear cookies to be asked again"
 * (stated in the privacy policy) is literally true. A same-tab custom event lets
 * the pixel react to a choice without a page reload.
 */
export type Consent = "granted" | "denied";
export type Region = "eu" | "open";

const COOKIE = "pv_consent";
export const CONSENT_EVENT = "pv-consent-change";

export function getConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)pv_consent=(granted|denied)\b/);
  return (match?.[1] as Consent | undefined) ?? null;
}

export function setConsent(value: Consent): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Region set by middleware. Defaults to the strict "eu" model if unknown. */
export function getRegion(): Region {
  if (typeof document === "undefined") return "eu";
  const match = document.cookie.match(/(?:^|;\s*)pv_region=(eu|open)\b/);
  return (match?.[1] as Region | undefined) ?? "eu";
}

/** Browser "do not sell/share" signal (Global Privacy Control). */
export function gpcEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** Whether the pixel is allowed to load right now. */
export function pixelAllowed(): boolean {
  if (gpcEnabled()) return false; // respect GPC everywhere
  const choice = getConsent();
  if (choice === "granted") return true;
  if (choice === "denied") return false;
  // No explicit choice: opt-out regions load by default; opt-in regions wait.
  return getRegion() === "open";
}

/** Whether to show the consent banner (opt-in regions, no choice yet, no GPC). */
export function shouldPromptConsent(): boolean {
  if (gpcEnabled()) return false;
  if (getConsent() !== null) return false;
  return getRegion() === "eu";
}
