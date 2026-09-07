"use client";

import { useEffect } from "react";
import { trackPixel } from "@/lib/pixel";
import { gtagConversion, GADS_MEMBER_LABEL } from "@/lib/google";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires the member-join conversion once, on the public /joined page after
 * Stripe checkout. The browser pixel shares its eventId (the Stripe session id)
 * with the server-side Meta "Subscribe" sent from the webhook, so Meta
 * de-duplicates the two. Google Ads gets its conversion here (client-side).
 * Guarded per session id so a refresh doesn't double-count.
 */
export function MembershipConversion({ eventId }: { eventId?: string }) {
  useEffect(() => {
    const key = `pv_member_${eventId ?? "once"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage unavailable — fall through and fire once for this view */
    }
    trackPixel("Subscribe", {}, eventId);
    gtagConversion(GADS_MEMBER_LABEL);
    trackEvent("membership_start");
  }, [eventId]);

  return null;
}
