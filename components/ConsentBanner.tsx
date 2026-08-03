"use client";

import { useEffect, useState } from "react";
import { META_PIXEL_ID } from "@/lib/pixel";
import { CLARITY_ID } from "@/lib/clarity";
import { setConsent, shouldPromptConsent } from "@/lib/consent";

/**
 * First-visit advertising-consent prompt. Shown only where prior opt-in is
 * required (EU/EEA/UK/CH) and the visitor hasn't chosen yet — elsewhere the
 * pixel uses an opt-out model and no banner appears. Accept loads the pixel;
 * decline stores the choice. Fixed to the viewport bottom so it causes no
 * layout shift.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ((META_PIXEL_ID || CLARITY_ID) && shouldPromptConsent()) setShow(true);
  }, []);

  if (!show) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
    setShow(false);
  }

  return (
    <div className="consent" role="dialog" aria-label="Analytics and advertising consent">
      <p className="consent-text">
        We use analytics and a Meta pixel to understand how the site is used and measure our
        advertising — but only if you agree. Decline and the site works exactly the same.{" "}
        <a href="/privacy">How we use data</a>.
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
