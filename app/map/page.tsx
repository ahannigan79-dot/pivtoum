import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";
import { PackageSignup } from "@/components/PackageSignup";
import { PageView } from "@/components/PageView";
import { careers } from "@/data/careers";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your free Career Map",
  description:
    "Build your free Career Map — all 28 careers scored for AI exposure, plus a high-level review of the careers you care about. Your first step into Winning in the Age of AI.",
  alternates: { canonical: "/map" },
};

const BAND = ["#C0472F", "#D98D7B", "#DFD5A2", "#A7CBA0", "#4E9E5E"];

/** The Career Map — distraction-free capture for paid ad traffic. Collects
 *  the stage + audience flags and up to five careers, then delivers the matching
 *  package. Challenger to /scores; nav hidden via SiteHeader. */
export default async function MapLanding({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const { career } = await searchParams;
  const preselect = typeof career === "string" ? career : undefined;
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

        <div className="scr-eyebrow">Winning in the Age of AI · Free Career Map</div>
        <div className="scr-tag">Careers, mapped for the age of AI</div>
        <h1 className="scr-h1">
          Find your{" "}
          <span className="hl" style={{ whiteSpace: "nowrap" }}>
            opening
          </span>{" "}
          in the age of AI.
        </h1>
        <p className="scr-sub">
          Build your free Career Map — all 28 careers scored, plus a high-level review of the
          careers that matter to you. See exactly where you stand.
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

        <PackageSignup careers={opts} preselect={preselect} />

        <div className="scr-community">
          <span className="scr-community-k">Winning in the Age of AI</span>
          <p>
            Your Career Map is the first step. Take it and join us — a community where we learn and
            grow together to get through this insane change and ultimately <b>win.</b>
          </p>
          <a className="scr-community-go" href={SITE.community}>See inside the community →</a>
        </div>

        <p className="scr-foot">
          Pivotum · The Career Map · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </p>
      </div>
    </main>
  );
}
