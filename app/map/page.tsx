import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";
import { ExposureCheck } from "@/components/ExposureCheck";
import { PageView } from "@/components/PageView";
import { careers } from "@/data/careers";
import { buildCheck } from "@/lib/exposure";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How exposed is your career to AI?",
  description:
    "Run the free Exposure Check — see how exposed your role is to AI, and why. Then unlock your full AI Exposure Report: your exact score, your winning strategy, and the moves that lower it.",
  alternates: { canonical: "/map" },
};

/** The AI Exposure Report landing — the band-only Exposure Check is the hero (run it,
 *  see your band, then capture email for the package + the community). Distraction-
 *  free capture for paid ad traffic; nav hidden via SiteHeader. */
export default async function MapLanding({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const { career } = await searchParams;
  const preselect = typeof career === "string" ? career : undefined;
  const checks = careers.map(buildCheck);

  return (
    <main className="scr">
      <PageView event="map_view" />
      <div className="scr-wrap">
        <div className="scr-logo">
          <Wordmark />
        </div>

        <div className="scr-eyebrow">Winning in the Age of AI · Free Exposure Check</div>
        <div className="scr-tag">Careers, mapped for the age of AI</div>
        <h1 className="scr-h1">
          How exposed is your career to{" "}
          <span className="hl" style={{ whiteSpace: "nowrap" }}>
            AI
          </span>
          ?
        </h1>
        <p className="scr-sub">
          Pick your role and see where you stand — in ten seconds, free. Then get your exact score and
          the 4 factors driving it, and see how to turn it into your opening.
        </p>

        <ExposureCheck checks={checks} preselect={preselect} />

        <div className="scr-community">
          <span className="scr-community-k">Winning in the Age of AI</span>
          <p>
            The Exposure Check shows you where you stand. Inside the community you turn it into your
            opening — your living Map, your pod, and people in your exact lane, so you come out <b>ahead.</b>
          </p>
          <a className="scr-community-go" href="/community">See inside the community →</a>
        </div>

        <p className="scr-foot">
          Pivotum · The AI Exposure Report · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </p>
      </div>
    </main>
  );
}
