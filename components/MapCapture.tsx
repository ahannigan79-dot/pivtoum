"use client";

import { useEffect, useState } from "react";
import { trackPixel } from "@/lib/pixel";
import { gtagConversion, GADS_LEAD_LABEL } from "@/lib/google";
import { trackEvent } from "@/lib/analytics";
import { captureClickIds, readClickIds } from "@/lib/attribution";

/**
 * The trimmed Career Map capture for /map. After the instant band reveal, the
 * only ask is first name + email — the role is already chosen above, locked to
 * one career. Keeps the full ad-funnel instrumentation (pixel + Conversions API
 * de-dupe, Google Ads, click-id attribution) intact.
 */
export function MapCapture({
  careerSlug, careerName, stage, score, factors, onUnlock,
}: {
  careerSlug: string; careerName: string; stage: "planning" | "active";
  score?: number; factors?: { label: string; kind: "expose" | "protect" }[];
  onUnlock?: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [hint, setHint] = useState("");

  useEffect(() => { captureClickIds(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return setHint("Add your first name.");
    setHint("");
    setStatus("sending");
    const eventId = crypto.randomUUID();
    let res: Response;
    try {
      res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName.trim(),
          source: "index",
          stage,
          audience: "self",       // /map is self-framing ("your career")
          careers: [careerSlug],  // locked to the one role they picked above
          score, factors,         // the number + 4 factors to echo into the email
          eventId,
          ...readClickIds(),
        }),
      });
    } catch {
      setHint("Something went wrong — try again.");
      return setStatus("error");
    }
    if (res.ok) {
      trackPixel("Lead", {}, eventId);
      gtagConversion(GADS_LEAD_LABEL);
      trackEvent("map_signup");
      if (onUnlock) { onUnlock(); return; }  // parent reveals the score inline
      setStatus("done");
      return;
    }
    // A deliverability rejection (422) carries a friendly message; show it and
    // let them fix the address — nothing is revealed to an unreachable inbox.
    const body = await res.json().catch(() => ({}));
    setHint(body?.error || "Something went wrong — try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="pkg pkg-done">
        <p className="pkg-done-h">Your Career Map is on its way.</p>
        <p className="pkg-done-s">
          Check your inbox — your Career Map for <b>{careerName}</b>, plus the 28-career index, is
          landing now. Didn&rsquo;t arrive? Check spam, it&rsquo;ll be there.
        </p>
      </div>
    );
  }

  return (
    <form className="pkg pkg-lean" onSubmit={submit}>
      <p className="pkg-lean-lede">
        Your score shows here instantly — and lands in your inbox with the <b>28-career index</b> and the{" "}
        <b>community guide</b> (10% off your first purchase inside).
      </p>
      <div className="pkg-final">
        <input
          id="pkg-name" type="text" required autoComplete="given-name" placeholder="First name"
          value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label="Your first name"
        />
        <input
          id="pkg-email" type="email" required autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Your email"
        />
        <button type="submit" className="pkg-go" disabled={status === "sending"}>
          {status === "sending" ? "Revealing…" : "Reveal my score"}
        </button>
      </div>
      <p className="pkg-fine">Free · instant · no spam · unsubscribe anytime</p>
      {hint ? <p className="pkg-hint">{hint}</p> : null}
    </form>
  );
}
