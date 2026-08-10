import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";
import { EmailSignup } from "@/components/EmailSignup";
import { PageView } from "@/components/PageView";

export const metadata: Metadata = {
  title: "Is your kid's career safe from AI?",
  description:
    "All 28 careers ranked by AI exposure — the safe-vs-exposed split inside each, and the one thing that decides it. Get the free breakdown by email.",
  alternates: { canonical: "/scores" },
};

const BAND = ["#C0472F", "#D98D7B", "#DFD5A2", "#A7CBA0", "#4E9E5E"];

/** Distraction-free landing page for paid ad traffic — one job: capture the
 *  email and deliver the free 28-score index. No nav (hidden via SiteHeader). */
export default function ScoresLanding() {
  return (
    <main className="scr">
      <PageView event="scores_view" />
      <div className="scr-wrap">
        <div className="scr-logo">
          <Wordmark />
        </div>

        <div className="scr-eyebrow">The Career Index · Free</div>
        <h1 className="scr-h1">
          Is your kid&rsquo;s career{" "}
          <span className="hl" style={{ whiteSpace: "nowrap" }}>
            safe from AI?
          </span>
        </h1>
        <p className="scr-sub">
          All 28 careers ranked by AI exposure — the safe-vs-exposed split inside each, and the one
          thing that decides it. Get the full breakdown, free.
        </p>

        <p className="scr-hook">
          Bedside nursing scores <b className="s">2.8</b>. Entry-level software, <b className="x">8.1</b>.
          Same year, same method.
        </p>

        <div className="scr-bar" aria-hidden="true">
          {BAND.map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
        <div className="scr-scale">
          <span className="lo">Highly exposed</span>
          <span className="hi">Well protected</span>
        </div>

        <EmailSignup
          source="index"
          label="Get the free 28-score index (PDF)"
          sub="Free · instant PDF · no spam · unsubscribe anytime"
          cta="Send me the 28 scores"
          flush
        />

        <div className="scr-stats">
          <div className="scr-stat">
            <b>28</b>
            <span>careers scored the same way</span>
          </div>
          <div className="scr-stat">
            <b>158</b>
            <span>individual tracks within them</span>
          </div>
          <div className="scr-stat">
            <b>6</b>
            <span>factors — the same for every career</span>
          </div>
        </div>

        <p className="scr-foot">
          Pivotum · The Career Index · <a href="/privacy">Privacy</a> ·{" "}
          <a href="/terms">Terms</a>
        </p>
      </div>
    </main>
  );
}
