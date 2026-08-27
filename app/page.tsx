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
  title: "Winning in the Age of AI — the community for getting ahead",
  description:
    "Winning in the Age of AI is the community where you turn the biggest shift in work into your opening — map where you stand, do the reps to get ahead, and win with people in your exact lane. Start free — 28 careers scored, plus a free trial inside.",
  alternates: { canonical: "/" },
};

const LOOP = [
  { k: "Learn", d: "The rules of the game — the stance that wins and the six levers that decide your exposure." },
  { k: "Map", d: "Where you stand: your exposure, your winning strategy, and the moves that lower it." },
  { k: "Build", d: "The reps — master the machine on what it's taking, and deepen the judgment it can't." },
  { k: "Evolve", d: "Ship your moves, re-score, and watch yourself pull ahead. The loop closing." },
];

const INCLUDED = [
  "Your living AI Career Map — re-scored as the field moves",
  "Your Together pod — a small group in your exact lane, keeping you at it",
  "The Judgment Gym & Workflow Rebuilds — reps that build your edge",
  "Live clinics, events, and direct access to the founder",
  "The full Learn curriculum and asset library, from day one",
];

export default function Home() {
  const indexRows = buildIndexRows();

  return (
    <div className="lp">
      <div className="lp-wrap">
        {/* Hero — lead with the community */}
        <section className="lp-hero dark">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-hero-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lp-hero-logo" src="/brand/pivotum-logo-plain.svg" alt="Pivotum" />
                <span className="lp-hero-sub">Winning in the Age of AI</span>
                <span className="lp-hero-ed">Fall 2026</span>
              </div>
              <h1 className="lp-h1">
                <span className="hl">Win</span> in the age of AI.
              </h1>
              <p className="lp-lede">
                The biggest shift work has seen in a century is also the biggest opening — for the
                people who face it head-on. <b>Winning in the Age of AI</b> is where you find your
                opening, do the reps to get ahead, and win alongside people in your exact lane.
              </p>
              <div className="lp-cta-row lp-hero-cta">
                <Link className="lp-btn" href={SITE.join}>
                  Start your free trial &rarr;
                </Link>
                <Link className="lp-btn ghost" href="/map">
                  Get your free Career Map
                </Link>
              </div>
              <p className="lp-hero-browse">
                <Link href="/community">Explore the community &rarr;</Link> · <a href="#index">All {careerCount} scores</a>
              </p>
              <p className="lp-creed">{SITE.creedWorker}</p>
            </div>

            <HeroContrast />
          </div>
        </section>

        {/* Front-and-center: learn more about the community (the full guide) */}
        <Link className="lp-community-strip" href="/community">
          <span className="lp-community-strip-k">New here?</span>
          <span>
            See everything inside <b>Winning in the Age of AI</b> — the Map, the reps, the pod, and the year.
            <span className="go"> Explore the community →</span>
          </span>
        </Link>

        {/* Inside — the Winning Loop */}
        <section className="lp-inside" id="inside">
          <div className="lp-inside-head">
            <div className="lp-community-eyebrow">Inside the community</div>
            <h2>One loop turns the shift into your opening.</h2>
            <p className="sub">
              Learn the game, map your ground, build your edge, and evolve as the field moves. Your
              Map is the spine — everything hangs off it, and your Together pod keeps you moving.
            </p>
          </div>
          <div className="lp-loop">
            {LOOP.map((s, i) => (
              <div className="lp-loopcard" key={s.k}>
                <span className="lp-loopnum">{i + 1}</span>
                <h3>{s.k}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Index — free scores as the opening */}
        <section className="lp-index" id="index">
          <div className="lp-index-head">
            <h2>Find your opening — start with the truth.</h2>
            <p className="sub">
              We score {careerCount} careers on the same six factors — bedside nursing 2.8,
              entry-level software 8.1. Knowing exactly where you stand is how you spot your opening
              and get ahead of it. Each row runs from a field&rsquo;s most protected role to its most exposed.
            </p>
            <p className="idx-free">
              <strong>Every career below is scored free.</strong> Tap any row for the read &mdash; the
              deeper breakdown, and your personal number, open with your free Career Map.
            </p>
          </div>

          <CareerIndex rows={indexRows} />

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

        {/* Membership — the trial */}
        <section className="lp-membership" id="join">
          <div className="lp-community-eyebrow">Winning in the Age of AI</div>
          <h2>Come out ahead — together.</h2>
          <p>
            The people who come through this in front won&rsquo;t be the ones who did it alone — they&rsquo;ll
            be the ones who learned and grew together. Membership gives you the whole loop, your pod,
            and the room. Try it free for seven days.
          </p>
          <ul className="lp-membership-list">
            {INCLUDED.map((it) => <li key={it}>{it}</li>)}
          </ul>
          <div className="lp-cta-row">
            <Link className="lp-btn" href={SITE.join}>
              Start your free trial &rarr;
            </Link>
            <Link className="lp-btn ghost" href="/community">
              See everything inside &rarr;
            </Link>
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
