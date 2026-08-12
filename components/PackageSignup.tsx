"use client";

import { useEffect, useState } from "react";
import { trackPixel } from "@/lib/pixel";
import { gtagConversion, GADS_LEAD_LABEL } from "@/lib/google";
import { trackEvent } from "@/lib/analytics";
import { captureClickIds, readClickIds } from "@/lib/attribution";

type Stage = "planning" | "active";
type Audience = "child" | "self";
interface CareerOpt {
  slug: string;
  name: string;
}

const MAX_PICKS = 5;

/**
 * The Career Map capture. One screen that collects the two flags that fork
 * the whole package — stage (planning vs already-in) and who it's for (child vs
 * self) — plus up to five careers of interest, then the email. Posts the lot
 * to /api/subscribe, which assembles and delivers the matching package.
 */
export function PackageSignup({ careers, preselect }: { careers: CareerOpt[]; preselect?: string }) {
  // A sampler can send its own career in via ?career=<slug>; pre-check it if it's
  // a real option, so arriving from a sampler starts one pick ahead.
  const seeded = preselect && careers.some((c) => c.slug === preselect) ? [preselect] : [];
  const [stage, setStage] = useState<Stage | "">("");
  const [audience, setAudience] = useState<Audience | "">("");
  const [picks, setPicks] = useState<string[]>(seeded);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [hint, setHint] = useState("");

  const full = picks.length >= MAX_PICKS;

  // Stash any ad click ids on arrival so a signup can be attributed server-side.
  useEffect(() => {
    captureClickIds();
  }, []);

  function togglePick(slug: string) {
    setPicks((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, slug];
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stage) return setHint("Pick where you are right now.");
    if (!audience) return setHint("Tell us who this is for.");
    if (picks.length === 0) return setHint("Choose at least one career.");
    setHint("");
    setStatus("sending");
    // Shared id so the browser Lead event and the server-side Conversions API
    // event de-duplicate; click ids let the server attribute the majority of
    // (mobile / in-app) traffic whose browser pixel is blocked.
    const eventId = crypto.randomUUID();
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "index", stage, audience, careers: picks, eventId, ...readClickIds() }),
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
          Check your inbox — the 28-career index, your guide, and the breakdowns you picked are
          landing now. Didn’t arrive? Check spam, it’ll be there.
        </p>
      </div>
    );
  }

  return (
    <form className="pkg" onSubmit={submit}>
      <fieldset className="pkg-field">
        <legend className="pkg-q">1 · Where are you right now?</legend>
        <div className="pkg-opts">
          <button
            type="button"
            className={`pkg-opt${stage === "planning" ? " on" : ""}`}
            onClick={() => setStage("planning")}
            aria-pressed={stage === "planning"}
          >
            <b>Still choosing</b>
            <span>a degree or career</span>
          </button>
          <button
            type="button"
            className={`pkg-opt${stage === "active" ? " on" : ""}`}
            onClick={() => setStage("active")}
            aria-pressed={stage === "active"}
          >
            <b>Already in it</b>
            <span>in a degree, or working</span>
          </button>
        </div>
      </fieldset>

      <fieldset className="pkg-field">
        <legend className="pkg-q">2 · Who’s this for?</legend>
        <div className="pkg-opts">
          <button
            type="button"
            className={`pkg-opt${audience === "child" ? " on" : ""}`}
            onClick={() => setAudience("child")}
            aria-pressed={audience === "child"}
          >
            <b>My child</b>
            <span>I’m the parent</span>
          </button>
          <button
            type="button"
            className={`pkg-opt${audience === "self" ? " on" : ""}`}
            onClick={() => setAudience("self")}
            aria-pressed={audience === "self"}
          >
            <b>Myself</b>
            <span>it’s my career</span>
          </button>
        </div>
      </fieldset>

      <fieldset className="pkg-field">
        <legend className="pkg-q">
          3 · Pick the careers that matter <span className="pkg-count">{picks.length}/{MAX_PICKS}</span>
        </legend>
        <div className="pkg-chips">
          {careers.map((c) => {
            const on = picks.includes(c.slug);
            return (
              <button
                type="button"
                key={c.slug}
                className={`pkg-chip${on ? " on" : ""}`}
                onClick={() => togglePick(c.slug)}
                aria-pressed={on}
                disabled={!on && full}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="pkg-final">
        <input
          id="pkg-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Your email"
        />
        <button type="submit" className="pkg-go" disabled={status === "sending"}>
          {status === "sending" ? "Building…" : "Build my free map"}
        </button>
      </div>
      <p className="pkg-fine">Free · instant · no spam · unsubscribe anytime</p>
      {hint ? <p className="pkg-hint">{hint}</p> : null}
      {status === "error" ? <p className="pkg-hint">Something went wrong — try again.</p> : null}
    </form>
  );
}
