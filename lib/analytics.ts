import { track } from "@vercel/analytics";
import { isProductionHost } from "@/lib/host";

/** Values Vercel Web Analytics accepts on a custom event. */
type EventValue = string | number | boolean | null;

/**
 * Thin wrapper over Vercel Web Analytics custom events. Centralises event names
 * so the funnel stays consistent across components, and swallows any error (and
 * the server-side no-op) so a telemetry call can never break a user action.
 *
 * These events are cookieless and aggregate — the same privacy footing as the
 * pageview analytics already disclosed — so they need no consent gate.
 *
 * Funnel:
 *   Top:  sampler_view / article_view → lead_signup   (content → subscribe)
 *   Buy:  buy_page_view → buy_ack_checked → checkout_start → purchase
 */
export function trackEvent(name: string, props?: Record<string, EventValue>): void {
  if (!isProductionHost()) return; // keep preview/staging testing out of the funnel
  try {
    track(name, props);
  } catch {
    /* analytics unavailable — never let telemetry break the flow */
  }
}
