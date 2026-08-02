"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { META_PIXEL_ID, trackPixel } from "@/lib/pixel";
import { pixelAllowed, CONSENT_EVENT } from "@/lib/consent";

/**
 * Fires a PageView on client-side navigations. The base snippet already sends
 * the first PageView when the pixel loads, so the initial run here is skipped
 * to avoid double-counting. Wrapped in Suspense because useSearchParams opts the
 * subtree into client rendering.
 */
function RouteChangePageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trackPixel("PageView");
  }, [pathname, searchParams]);

  return null;
}

/**
 * Meta Pixel base install. Renders nothing — and loads no script — unless a
 * pixel id is configured AND the pixel is allowed for this visitor: granted in
 * opt-in regions, on by default (unless GPC/declined) in opt-out regions.
 * Reacts to a consent change in the same tab so accepting loads the pixel
 * without a reload.
 */
export function MetaPixel() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(pixelAllowed());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!META_PIXEL_ID || !allowed) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <RouteChangePageViews />
      </Suspense>
    </>
  );
}
