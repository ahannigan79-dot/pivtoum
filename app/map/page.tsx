import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";
import { PackageSignup } from "@/components/PackageSignup";
import { PageView } from "@/components/PageView";
import { careers } from "@/data/careers";

export const metadata: Metadata = {
  title: "Your free AI Career Map",
  description:
    "Build your free AI Career Map — the 28-career AI-exposure index, a guide written for exactly where you are, and full breakdowns on the three careers you care about.",
  alternates: { canonical: "/map" },
};

const BAND = ["#C0472F", "#D98D7B", "#DFD5A2", "#A7CBA0", "#4E9E5E"];

/** The AI Career Map — distraction-free capture for paid ad traffic. Collects
 *  the stage + audience flags and up to three careers, then delivers the matching
 *  package. Challenger to /scores; nav hidden via SiteHeader. */
export default function MapLanding() {
  const opts = careers
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="scr">
      <PageView event="map_view" />
      <div className="scr-wrap">
        <div className="scr-logo">
          <Wordmark />
        </div>

        <div className="scr-eyebrow">The AI Career Map · Free</div>
        <h1 className="scr-h1">
          Is your kid&rsquo;s career{" "}
          <span className="hl" style={{ whiteSpace: "nowrap" }}>
            safe from AI?
          </span>
        </h1>
        <p className="scr-sub">
          Build your free AI Career Map — all 28 careers scored, a short guide written for exactly
          where you stand, and the full breakdown on the three careers that matter to you.
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

        <PackageSignup careers={opts} />

        <p className="scr-foot">
          Pivotum · The AI Career Map · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </p>
      </div>
    </main>
  );
}
