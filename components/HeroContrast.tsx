import { careerCount } from "@/data/careers";

/** The hero's safe-vs-exposed contrast: bedside nursing 2.8 vs entry software 8.1.
 *  Single-tone — the numbers carry the meaning in the exposure palette (protected
 *  green vs exposed coral); the hand-drawn circles are retired. */
export function HeroContrast() {
  return (
    <div className="lp-contrast" aria-hidden="true">
      <div className="lp-contrast-item">
        <span className="lp-draw dual safe">2.8</span>
        <span className="lp-cap">
          <b>Bedside nursing</b>protected by hands, trust &amp; law
        </span>
      </div>
      <div className="lp-contrast-item">
        <span className="lp-draw dual delay">8.1</span>
        <span className="lp-cap">
          <b>Entry-level software</b>2nd most exposed of {careerCount}
        </span>
      </div>
    </div>
  );
}
