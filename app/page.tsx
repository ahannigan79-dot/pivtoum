import Link from "next/link";
import { careers, careerRange } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Interim index. The full index (range bars, sorted by safest track, print
 * layout) is built in a later step; this lists what's published so far.
 */
export default function Home() {
  const sorted = [...careers].sort(
    (a, b) => careerRange(a).safest - careerRange(b).safest,
  );

  return (
    <div className="page">
      <div className="body">
        <header>
          <div className="crumb">
            <span>Pivotum</span>
            <i>/</i>
            <span>Fall 2026</span>
          </div>
          <h1>How exposed is your career to AI?</h1>
          <p className="kicker">
            Twenty-something careers, scored the same way on a fixed methodology, re-scored every
            six months. Free samplers — nothing gated.
          </p>
        </header>

        <div className="rel">
          {sorted.map((c) => {
            const { safest, exposed } = careerRange(c);
            const range =
              safest === exposed ? safest.toFixed(1) : `${safest.toFixed(1)}–${exposed.toFixed(1)}`;
            const inner = (
              <>
                <span>{c.name}</span>
                <span className="s">{range}</span>
              </>
            );
            return hasSamplerPage(c.slug) ? (
              <Link key={c.slug} href={`/careers/${c.slug}`}>
                {inner}
              </Link>
            ) : (
              <a key={c.slug} aria-disabled="true">
                {inner}
              </a>
            );
          })}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
