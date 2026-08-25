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
  careerSlug, careerName, stage,
}: { careerSlug: string; careerName: string; stage: "planning" | "active" }) {
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
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName: firstName.trim(),
        source: "index",
        stage,
        audience: "self",       // /map is self-framing ("your career")
        careers: [careerSlug],  // locked to the one role they picked above
        eventId,
        ...readClickIds(),
      }),
    });
    if (res.ok) {
      trackPixel("Lead", {}, eventId);
      gtagConversion(GADS_LEAD_LABEL);
      trackEvent("map_signup");
    }
    setStatus(res.ok ? "done" : "error");
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
        Enter your details and we&rsquo;ll build your full Career Map for <b>{careerName}</b> — your
        exact score, your winning strategy, and the moves that lower it.
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
          {status === "sending" ? "Building…" : "Build my free Career Map"}
        </button>
      </div>
      <p className="pkg-fine">Free · instant · no spam · unsubscribe anytime</p>
      {hint ? <p className="pkg-hint">{hint}</p> : null}
      {status === "error" ? <p className="pkg-hint">Something went wrong — try again.</p> : null}
    </form>
  );
}
