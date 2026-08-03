"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GOOGLE_ADS_ID } from "@/lib/google";
import { pixelAllowed, CONSENT_EVENT } from "@/lib/consent";
import { isProductionHost } from "@/lib/host";

/**
 * Google Ads (gtag.js) base tag. Loads only when a tag id is configured AND the
 * visitor's advertising consent allows it — same regional/GPC rules as the Meta
 * pixel. Enables conversion tracking and remarketing.
 */
export function GoogleAds() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(pixelAllowed() && isProductionHost());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!GOOGLE_ADS_ID || !allowed) return null;

  return (
    <>
      <Script
        id="google-ads-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
