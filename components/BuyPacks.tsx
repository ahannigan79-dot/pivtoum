"use client";

import Link from "next/link";
import { useState } from "react";
import { PACKS } from "@/lib/packs";

/**
 * Pack chooser with the required pre-purchase acknowledgement. The pack buttons
 * post to /api/checkout but stay disabled until the box is ticked; the checkbox
 * state is also sent as a hidden `ack` field so the server can re-check it. The
 * server (and the recorded order) is the source of truth for the acknowledgement.
 */
export function BuyPacks() {
  const [ack, setAck] = useState(false);

  return (
    <>
      <label className="ack">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
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
            <button
              type="submit"
              className={`tier${p.tag ? " best" : ""}`}
              disabled={!ack}
              aria-disabled={!ack}
            >
              <span className="n">{p.label}</span>
              {p.tag ? <span className="tag">{p.tag}</span> : null}
              <span className="p">{p.price}</span>
            </button>
          </form>
        ))}
      </div>
    </>
  );
}
