"use client";

import { useState } from "react";

type Variant = "inline" | "panel";

interface Props {
  /** 'panel' is a boxed aside; 'inline' is a lighter in-flow block. */
  variant?: Variant;
  /** Specific per placement, e.g. 'sampler-nursing-mid' — passed to Substack. */
  source: string;
  heading?: string;
  blurb?: string;
}

const DEFAULT_HEADING = "The findings, every two weeks";
const DEFAULT_BLURB =
  "We re-score everything every six months and publish what moved — including where we were wrong. Free.";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function SubscribeForm({
  variant = "panel",
  source,
  heading = DEFAULT_HEADING,
  blurb = DEFAULT_BLURB,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          firstUrl: typeof document !== "undefined" ? document.referrer || undefined : undefined,
          currentUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: res.ok }))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("done");
        // Conversion event — fire only on confirmed success.
        if (typeof window !== "undefined" && typeof window.fbq === "function") {
          window.fbq("track", "Lead", { content_name: source });
        }
      } else {
        setError(data.error || "That didn't go through. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("That didn't go through. Please try again.");
      setStatus("error");
    }
  }

  const inputId = `subscribe-${source}`;

  return (
    <section className={`subscribe subscribe--${variant}`}>
      {status === "done" ? (
        <p className="subscribe-success" aria-live="polite">
          You&rsquo;re subscribed. The first thing you&rsquo;ll get is{" "}
          <mark className="hl">the full essay behind the index</mark>.
        </p>
      ) : (
        <>
          <h3 className="subscribe-heading">{heading}</h3>
          {blurb ? <p className="subscribe-blurb">{blurb}</p> : null}
          <form className="subscribe-form" onSubmit={submit} noValidate>
            <label className="subscribe-label vh" htmlFor={inputId}>
              Email address
            </label>
            <div className="subscribe-row">
              <input
                id={inputId}
                className="subscribe-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
              />
              <button className="subscribe-btn" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "…" : "Subscribe"}
              </button>
            </div>
            <p className="subscribe-status" aria-live="polite">
              {status === "error" ? <span className="subscribe-error">{error}</span> : null}
            </p>
            <p className="subscribe-fine">No spam. Unsubscribe in one click.</p>
          </form>
        </>
      )}
    </section>
  );
}
