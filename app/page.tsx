import Link from "next/link";
import type { Metadata } from "next";
import { careers, careerRange, careerCount } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "Pivotum — Which careers is AI reshaping?",
  description:
    "Pivotum scores 28 careers on how exposed they are to AI — the same six factors, re-scored every six months, with the reasoning shown. Help your family choose a degree with evidence, not fear.",
  alternates: { canonical: "/" },
};

const DOMAIN = 10; // scores run 1–10
const HAND =
  "M96 12C78 3 40 4 22 16 4 28 9 47 30 55c21 8 60 4 74-9 12-11 6-27-16-35-10-4-25-4-34-1";

export default function Home() {
  const rows = careers
    .map((c) => ({ c, ...careerRange(c) }))
    .sort((a, b) => a.safest - b.safest || a.exposed - b.exposed);

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
              <h1 className="lp-h1">Help your kid choose a career AI won&rsquo;t hollow out.</h1>
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
            </div>

            <div className="lp-contrast" aria-hidden="true">
              <div className="lp-contrast-item">
                <span className="lp-num-lo">
                  <span className="mark">2.8</span>
                </span>
                <span className="lp-cap">
                  <b>Bedside nursing</b>protected by hands, trust &amp; law
                </span>
              </div>
              <div className="lp-contrast-item">
                <span className="lp-draw big">
                  8.1
                  <svg viewBox="0 0 120 62" aria-hidden="true">
                    <path d={HAND} />
                  </svg>
                </span>
                <span className="lp-cap">
                  <b>Entry-level software</b>2nd most exposed of {careerCount}
                </span>
              </div>
            </div>
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
              From the most protected track to the most exposed. The circled number is the safest
              role in each field — tap any career for its free sampler.
            </p>
          </div>

          <div className="index">
            <div className="idx-scale">
              <span>Career</span>
              <span className="idx-ends">
                <span>Safest 0</span>
                <span>10 Most exposed</span>
              </span>
              <span />
            </div>
            {rows.map(({ c, safest, exposed }) => {
              const left = (safest / DOMAIN) * 100;
              const width = Math.max(((exposed - safest) / DOMAIN) * 100, 1.5);
              const inner = (
                <>
                  <span className="idx-name">{c.name}</span>
                  <span className="idx-track">
                    <span className="idx-seg" style={{ left: `${left}%`, width: `${width}%` }} />
                  </span>
                  <span className="idx-nums">
                    <span className="idx-low">{safest.toFixed(1)}</span>&ndash;{exposed.toFixed(1)}
                  </span>
                </>
              );
              return hasSamplerPage(c.slug) ? (
                <Link key={c.slug} className="idx-row" href={`/careers/${c.slug}`}>
                  {inner}
                </Link>
              ) : (
                <span key={c.slug} className="idx-row">
                  {inner}
                </span>
              );
            })}
          </div>

          {/* Print: two numeric columns, no bars */}
          <div className="index-print">
            <div className="ipr-head">
              <span>Career</span>
              <span>Safest</span>
              <span>Most exposed</span>
            </div>
            {rows.map(({ c, safest, exposed }) => (
              <div className="ipr-row" key={c.slug}>
                <span>{c.name}</span>
                <span>{safest.toFixed(1)}</span>
                <span>{exposed.toFixed(1)}</span>
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
              Read one free
            </Link>
          </div>
        </section>

        <EmailSignup />
        <SiteFooter />
      </div>
    </div>
  );
}
