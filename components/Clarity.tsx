"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CLARITY_ID } from "@/lib/clarity";
import { pixelAllowed, CONSENT_EVENT } from "@/lib/consent";
import { isProductionHost } from "@/lib/host";

/**
 * Microsoft Clarity install. Renders nothing — and loads no script — unless a
 * Clarity id is configured AND behavioural tracking is allowed for this visitor
 * (the same consent gate as the Meta pixel: opt-in in the EU/EEA/UK/CH, opt-out
 * elsewhere unless GPC/declined). Reacts to a same-tab consent change so
 * accepting starts Clarity without a reload.
 */
export function Clarity() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(pixelAllowed() && isProductionHost());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!CLARITY_ID || !allowed) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
