import Link from "next/link";
import type { Metadata } from "next";
import { careerCount } from "@/data/careers";
import { SITE } from "@/lib/site";
import { buildIndexRows } from "@/lib/career-index";
import { CareerIndex } from "@/components/CareerIndex";
import { HeroContrast } from "@/components/HeroContrast";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "Pivotum — Which careers is AI reshaping?",
  description:
    "Pivotum scores 28 careers on how exposed they are to AI — the same six factors, re-scored every six months, with the reasoning shown. Help your family choose a degree with evidence, not fear.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const indexRows = buildIndexRows();

  return (
    <div className="lp">
      <div className="lp-wrap">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-eyebrow">
                <b>Pivotum</b> · The AI career index · Fall 2026
              </div>
              <h1 className="lp-h1">Help your kid choose a career that lasts.</h1>
              <p className="lp-lede">
                We score {careerCount} careers on how exposed they are to AI — the same six
                factors, re-scored every six months, with the reasoning shown. The biggest decision
                on the table, made with evidence instead of fear.
              </p>
              <div className="lp-cta-row">
                <a className="lp-btn" href="#index">
                  See all {careerCount} careers
                </a>
                <Link className="lp-btn ghost" href="/methodology">
                  How we score
                </Link>
              </div>
              <p className="lp-creed">{SITE.creed}</p>
              <p className="lp-selfcheck">
                Not choosing for a teenager? <Link href="/your-career">Check for yourself &rarr;</Link>
              </p>
            </div>

            <HeroContrast />
          </div>
        </section>

        {/* Confidence / value */}
        <section className="lp-values">
          <div className="lp-value">
            <h3>One number, fully explained</h3>
            <p>Every score comes with its reasoning and a three-year trend — never a black box.</p>
          </div>
          <div className="lp-value">
            <h3>The same yardstick for all {careerCount}</h3>
            <p>A paramedic and a paralegal, scored on the identical six factors and weights.</p>
          </div>
          <div className="lp-value">
            <h3>We publish where we might be wrong</h3>
            <p>A fixed, public methodology, re-scored every six months. Free — nothing gated.</p>
          </div>
        </section>

        {/* The finding */}
        <section className="lp-finding">
          <p>
            <span className="hl">The safest degrees aren&rsquo;t the ones you&rsquo;d guess.</span>{" "}
            Bedside nursing scores 2.8; entry-level software, 8.1. Physical therapy, 2.5; graphic
            design, 8.4. Move the same work behind a screen and its exposure roughly doubles.
          </p>
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
              <strong>Every career below is a free sampler.</strong> Tap any row to read the full
              reasoning and sources &mdash; no signup, no payment.
            </p>
          </div>

          <CareerIndex rows={indexRows} />

          {/* Print: two numeric columns, no bars */}
          <div className="index-print">
            <div className="ipr-head">
              <span>Career</span>
              <span>Safest</span>
              <span>Most exposed</span>
            </div>
            {indexRows.map((r) => (
              <div className="ipr-row" key={r.slug}>
                <span>{r.name}</span>
                <span>{r.safest.toFixed(1)}</span>
                <span>{r.exposed.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="lp-closing">
          <h2>Weighing two or three seriously?</h2>
          <p>
            The full profiles cover the honest downsides, the routes in, and what to actually do —
            for the careers your family is really considering.
          </p>
          <div className="lp-cta-row">
            <Link className="lp-btn" href="/buy">
              Get the full profiles
            </Link>
            <Link className="lp-btn ghost" href="/careers/computer-science">
              Read the full profile free
            </Link>
            <Link className="lp-btn ghost" href="/careers/computer-science/student">
              Read the student version free
            </Link>
          </div>
        </section>

        <section id="subscribe">
          <EmailSignup />
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
