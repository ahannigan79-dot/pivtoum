import { careerCount } from "@/data/careers";

/** The hero's safe-vs-exposed contrast, as a small framed data panel: bedside
 *  nursing 2.8 vs entry software 8.1. Single-tone — the numbers carry the meaning
 *  in the exposure palette (protected green vs exposed coral), aligned in a titled
 *  card so they read as a deliberate stat, not floating numerals. */
export function HeroContrast() {
  return (
    <aside className="lp-spread">
      <div className="lp-spread-k">The exposure spread · 0–10</div>
      <div className="lp-spread-row">
        <span className="lp-spread-n safe">2.8</span>
        <span className="lp-spread-cap">
          <b>Bedside nursing</b>Protected by hands, trust &amp; law
        </span>
      </div>
      <div className="lp-spread-row">
        <span className="lp-spread-n exp">8.1</span>
        <span className="lp-spread-cap">
          <b>Entry-level software</b>2nd most exposed of {careerCount}
        </span>
      </div>
      <div className="lp-spread-foot">All {careerCount} careers, scored free →</div>
    </aside>
  );
}
