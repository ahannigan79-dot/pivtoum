import Link from "next/link";
import type { Metadata } from "next";
import { careers, careerRange, careerCount } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "How exposed is your career to AI? — Pivotum",
  description:
    "Every career we track, scored for AI exposure on the same six factors — ranked from most protected to most exposed. Free samplers for parents and students choosing a degree.",
  alternates: { canonical: "/" },
};

const DOMAIN = 10; // scores run 1–10

export default function Home() {
  const rows = careers
    .map((c) => ({ c, ...careerRange(c) }))
    .sort((a, b) => a.safest - b.safest || a.exposed - b.exposed);

  return (
    <div className="page">
      <div className="body">
        <header>
          <h1>How exposed is your career to AI?</h1>
          <p className="hero-finding">
            Bedside nursing scores <strong>2.8</strong>. Entry-level software scores{" "}
            <strong>8.1</strong>.{" "}
            <span className="hl">The safest degrees aren&rsquo;t the ones you&rsquo;d guess.</span>
          </p>
          <p className="kicker">
            {careerCount} careers, scored the same way on a fixed, published methodology and
            re-scored every six months. Each bar runs from the most protected track to the most
            exposed. Free samplers — nothing gated.{" "}
            <Link href="/methodology">How we score →</Link>
          </p>
        </header>

        {/* Screen: range bars */}
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
            const range = safest === exposed ? safest.toFixed(1) : `${safest.toFixed(1)}–${exposed.toFixed(1)}`;
            const inner = (
              <>
                <span className="idx-name">{c.name}</span>
                <span className="idx-track">
                  <span className="idx-seg" style={{ left: `${left}%`, width: `${width}%` }} />
                </span>
                <span className="idx-nums">{range}</span>
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

        <EmailSignup />
        <SiteFooter />
      </div>
    </div>
  );
}
