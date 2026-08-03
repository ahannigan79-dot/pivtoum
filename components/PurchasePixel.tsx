"use client";

import { useEffect } from "react";
import { trackPixel } from "@/lib/pixel";
import { gtagConversion, GADS_PURCHASE_LABEL } from "@/lib/google";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires the Meta Pixel and Google Ads Purchase conversions once per order. The
 * claim page can be revisited to re-download, so we guard on the token in
 * sessionStorage to avoid double-counting the same purchase.
 */
export function PurchasePixel({
  token,
  value,
  currency = "USD",
}: {
  token: string;
  value: number;
  currency?: string;
}) {
  useEffect(() => {
    const key = `pv_purchase_${token}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage unavailable — fall through and fire once for this view */
    }
    trackPixel("Purchase", { value, currency });
    gtagConversion(GADS_PURCHASE_LABEL, { value, currency });
    trackEvent("purchase", { value, currency });
  }, [token, value, currency]);

  return null;
}
