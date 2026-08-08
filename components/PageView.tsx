"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a single custom analytics event on mount — the client-side hook that lets
 * server-rendered content pages (samplers, articles) report into the funnel. Named
 * so we can measure the top of the funnel (e.g. sampler_view → lead_signup).
 */
export function PageView({ event }: { event: string }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);
  return null;
}
