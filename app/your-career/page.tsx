import type { Metadata } from "next";
import Link from "next/link";
import { careerCount } from "@/data/careers";
import { SITE, EDITION } from "@/lib/site";
import { buildIndexRows } from "@/lib/career-index";
import { CareerIndex } from "@/components/CareerIndex";
import { HeroContrast } from "@/components/HeroContrast";
import { EmailSignup } from "@/components/EmailSignup";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Is Your Career Safe From AI?",
  description:
    `Worried AI is coming for your job? Pivotum scores ${careerCount} careers on AI exposure — the same six factors, re-scored every six months, with the reasoning shown. Find your field and see exactly where it stands.`,
  alternates: { canonical: "/your-career" },
};

export default function YourCareer() {
  const indexRows = buildIndexRows();

  return (
    <div className="lp">
      <div className="lp-wrap">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-eyebrow">
                <b>Pivotum</b> · The AI career index · {EDITION}
              </div>
              <h1 className="lp-h1">Is your career safe from AI?</h1>
              <p className="lp-lede">
                We score {careerCount} careers on how exposed they are to AI — the same six factors,
                re-scored every six months, with the reasoning shown. Find your field below and see
                exactly where it stands, and which part of it is most at risk.
              </p>
              <div className="lp-cta-row">
                <a className="lp-btn" href="#index">
                  Check your exposure
                </a>
                <Link className="lp-btn ghost" href="/methodology">
                  How we score
                </Link>
              </div>
              <p className="lp-creed">{SITE.creedWorker}</p>
              <p className="lp-selfcheck">
                Choosing for a teenager instead? <Link href="/">Check for your kid &rarr;</Link>
              </p>
            </div>

            <HeroContrast />
          </div>
        </section>

        {/* Index */}
        <section className="lp-index" id="index">
          <div className="lp-index-head">
            <h2>Every career, scored</h2>
            <p className="sub">
              Each row runs from a field&rsquo;s most protected role to its most exposed. Green marks
              a genuinely low-exposure entry; red, one that&rsquo;s highly exposed.
            </p>
            <p className="idx-free">
              <strong>Every career below is a free read.</strong> Tap your field for the full
              reasoning and sources &mdash; no signup, no payment.
            </p>
          </div>

          <CareerIndex rows={indexRows} />
        </section>

        {/* Closing — audience-building, not a parent-profile push */}
        <section className="lp-closing">
          <h2>Keep an eye on your field</h2>
          <p>
            We re-score every six months and publish what changes &mdash; the findings that shift
            how a career reads, like why pharmacy scores worse than nursing. Get them by email as
            the ground moves.
          </p>
        </section>

        <section id="subscribe">
          <EmailSignup />
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
