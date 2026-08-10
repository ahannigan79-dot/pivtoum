"use client";

import { useState } from "react";
import { trackPixel } from "@/lib/pixel";
import { gtagConversion, GADS_LEAD_LABEL } from "@/lib/google";
import { trackEvent } from "@/lib/analytics";

interface EmailSignupProps {
  /** Bold prompt above the field. */
  label?: string;
  /** Optional supporting line under the label. */
  sub?: string;
  /** Button text. */
  cta?: string;
  /** Confirmation shown after a successful signup. */
  done?: string;
  /** Which PDF to email: a sampler slug, or "index" for all 28 scores. */
  source?: string;
  /** Drop the top border/margin when the form leads a block rather than closing one. */
  flush?: boolean;
}

export function EmailSignup({
  label = "Email me the full 28-career index (PDF)",
  sub = "Every career scored, each with a plain-English read on where it’s safe and where it’s exposed — plus Steering Through Change, our quarterly read on where the landscape’s shifting. Free, no spam, unsubscribe anytime.",
  cta = "Email me the PDF",
  done = "Check your inbox — your PDF (and a subscriber discount) is on its way.",
  source = "index",
  flush = false,
}: EmailSignupProps = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const cls = flush ? "signup signup-flush" : "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
    if (res.ok) {
      trackPixel("Lead");
      gtagConversion(GADS_LEAD_LABEL);
      trackEvent("lead_signup");
    }
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className={cls}>
        <p className="signup-note">{done}</p>
      </div>
    );
  }

  return (
    <form className={cls} onSubmit={submit}>
      <label className="signup-label" htmlFor="signup-email">
        {label}
      </label>
      {sub ? <p className="signup-sub">{sub}</p> : null}
      <div className="signup-row">
        <input
          id="signup-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "…" : cta}
        </button>
      </div>
      {status === "error" ? <p className="signup-note">Something went wrong — try again.</p> : null}
    </form>
  );
}
