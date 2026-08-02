"use client";

import { useEffect, useState } from "react";
import { META_PIXEL_ID } from "@/lib/pixel";
import { getConsent, setConsent } from "@/lib/consent";

/**
 * First-visit advertising-consent prompt. Only appears when a Meta pixel is
 * configured and the visitor hasn't chosen yet. Accept loads the pixel; decline
 * stores the choice and the pixel never loads. Fixed to the bottom of the
 * viewport so it causes no layout shift.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (META_PIXEL_ID && getConsent() === null) setShow(true);
  }, []);

  if (!show) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
    setShow(false);
  }

  return (
    <div className="consent" role="dialog" aria-label="Advertising consent">
      <p className="consent-text">
        We use a Meta pixel to measure our advertising — but only if you agree. Decline and the site
        works exactly the same. <a href="/privacy">How we use data</a>.
      </p>
      <div className="consent-actions">
        <button type="button" className="consent-btn decline" onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" className="consent-btn accept" onClick={() => choose("granted")}>
          Accept
        </button>
      </div>
    </div>
  );
}
