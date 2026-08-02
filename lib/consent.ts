/**
 * Advertising-consent state for the Meta pixel. Stored in a first-party cookie
 * so that "clear cookies to be asked again" (stated in the privacy policy) is
 * literally true. A same-tab custom event lets the pixel react to a choice
 * without a page reload.
 */
export type Consent = "granted" | "denied";

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
