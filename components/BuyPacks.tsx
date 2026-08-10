"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PACKS, EXPERT_ADDON } from "@/lib/packs";
import { trackEvent } from "@/lib/analytics";

/**
 * Pack chooser with the required pre-purchase acknowledgement. The pack buttons
 * post to /api/checkout but stay disabled until the box is ticked; the checkbox
 * state is also sent as a hidden `ack` field so the server can re-check it. The
 * server (and the recorded order) is the source of truth for the acknowledgement.
 */
export function BuyPacks() {
  const [ack, setAck] = useState(false);
  const [expert, setExpert] = useState(false);

  // Funnel anchor: how many reach the buy page at all (the denominator for
  // ack-checked → checkout_start → purchase).
  useEffect(() => {
    trackEvent("buy_page_view");
  }, []);

  return (
    <>
      <label className="ack">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => {
            setAck(e.target.checked);
            if (e.target.checked) trackEvent("buy_ack_checked");
          }}
          aria-describedby="ack-text"
        />
        <span id="ack-text">
          I understand these publications are analysis rather than advice, and that download begins
          immediately. <Link href="/terms">Terms</Link> · <Link href="/refunds">Refunds</Link>
        </span>
      </label>

      <div className="tiers">
        {PACKS.map((p) => (
          <form key={p.size} action="/api/checkout" method="post">
            <input type="hidden" name="pack" value={p.size} />
            <input type="hidden" name="ack" value={ack ? "1" : ""} />
            <input type="hidden" name="expert" value={expert ? "1" : ""} />
            <button
              type="submit"
              className={`tier${p.tag ? " best" : ""}`}
              disabled={!ack}
              aria-disabled={!ack}
              onClick={() => trackEvent("checkout_start", { pack: p.size, expert })}
            >
              <span className="n">{p.label}</span>
              {p.tag ? <span className="tag">{p.tag}</span> : null}
              <span className="p">
                {expert ? `$${(p.priceCents + EXPERT_ADDON.priceCents) / 100}` : p.price}
              </span>
            </button>
          </form>
        ))}
      </div>

      <label className="ack addon">
        <input
          type="checkbox"
          checked={expert}
          onChange={(e) => {
            setExpert(e.target.checked);
            if (e.target.checked) trackEvent("expert_addon_checked");
          }}
        />
        <span>
          <strong>Add the Expert Meeting — {EXPERT_ADDON.price}.</strong> Two 1-hour sessions with
          the founder to talk through your family&rsquo;s shortlist, live. Added to whichever pack
          you choose above. Limited slots.
        </span>
      </label>
    </>
  );
}
