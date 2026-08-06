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
  /** Where to send the reader after signup to collect the lead magnet. Pass null to disable. */
  deliver?: string | null;
  /** Drop the top border/margin when the form leads a block rather than closing one. */
  flush?: boolean;
}

export function EmailSignup({
  label = "Get the free Parent’s AI-Proofing Starter Kit",
  sub = "The three-question test to size up any career your kid names, how to read it, and how to raise it with your teenager — plus each new essay. Free, no spam, unsubscribe anytime.",
  cta = "Send me the kit",
  done = "You’re in — your Starter Kit is ready below, and the next essay is on its way.",
  deliver = "/starter-kit",
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
    return (
      <div className={cls}>
        <p className="signup-note">{done}</p>
        {deliver ? (
          <p className="signup-note">
            <a className="signup-deliver" href={deliver}>
              Open your Starter Kit &rarr;
            </a>
          </p>
        ) : null}
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
