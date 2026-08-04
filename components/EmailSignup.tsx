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
}

export function EmailSignup({
  label = "Get the next edition — free",
  sub = "We re-score careers every six months and publish what changes. By email, no spam — unsubscribe anytime.",
  cta = "Subscribe",
  done = "You’re in — watch your inbox for the next edition.",
}: EmailSignupProps = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      trackPixel("Lead");
      gtagConversion(GADS_LEAD_LABEL);
      trackEvent("lead_signup");
    }
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return <p className="signup-note">{done}</p>;
  }

  return (
    <form className="signup" onSubmit={submit}>
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
