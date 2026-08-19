import Link from "next/link";
import type { Metadata } from "next";
import { careerCount } from "@/data/careers";
import { SITE } from "@/lib/site";
import { buildIndexRows } from "@/lib/career-index";
import { CareerIndex } from "@/components/CareerIndex";
import { StarterKitCta } from "@/components/StarterKitCta";
import { HeroContrast } from "@/components/HeroContrast";
import { SiteFooter } from "@/components/SiteFooter";

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
        {/* Hero — dark bookend */}
        <section className="lp-hero dark">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-eyebrow">
                <b>Pivotum</b> · Winning in the Age of AI · Fall 2026
              </div>
              <h1 className="lp-h1">
                <span className="hl">Win</span> in the age of AI.
              </h1>
              <p className="lp-lede">
                The biggest shift work has seen in a century is also the biggest opening — for the
                people who can see it first. It starts with knowing exactly where you stand: we
                score {careerCount} careers on their exposure to AI, free, with the reasoning shown —
                then show you where the room to move is.
              </p>
              <div className="lp-cta-row lp-hero-cta">
                <Link className="lp-btn" href="/map">
                  Get your free Career Map &rarr;
                </Link>
                <a className="lp-btn ghost" href="#index">
                  See all {careerCount} scores
                </a>
              </div>
              <p className="lp-hero-browse">
                <Link href="/methodology">How we score &rarr;</Link>
              </p>
              <p className="lp-creed">{SITE.creed}</p>
            </div>

            <HeroContrast />
          </div>
        </section>

        {/* Community teaser — the point, up top */}
        <a className="lp-community-strip" href="#community">
          <span className="lp-community-strip-k">More than a score</span>
          <span>
            It’s <b>Winning in the Age of AI</b> — a community learning to get ahead of the change,
            together. <span className="go">Join us →</span>
          </span>
        </a>

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
            <p>A fixed, public methodology, re-scored twice a year. The scores are free.</p>
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
              <strong>Every career below is scored free.</strong> Tap any row for the read &mdash;
              the deeper breakdown opens with your free Career Map.
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

        {/* The community — the destination */}
        <section className="lp-community" id="community">
          <div className="lp-community-eyebrow">Winning in the Age of AI</div>
          <h2>You don’t have to figure this out alone.</h2>
          <p>
            This is the strangest, biggest change work has ever seen — and the people who come
            through it ahead won’t be the ones who did it alone. They’ll be the ones who learned and
            grew together. So take the step and join us: a community to understand what’s happening,
            see where you stand, get ahead of the change — and ultimately win.
          </p>
          <div className="lp-cta-row">
            <Link className="lp-btn" href="/map">
              Take the first step — get your free Career Map
            </Link>
            <a className="lp-btn ghost" href={SITE.community}>
              See inside the community →
            </a>
          </div>
        </section>

        <section id="subscribe">
          <StarterKitCta />
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
