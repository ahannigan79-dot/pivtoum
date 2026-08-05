import { careerCount } from "@/data/careers";

const HAND =
  "M96 12C78 3 40 4 22 16 4 28 9 47 30 55c21 8 60 4 74-9 12-11 6-27-16-35-10-4-25-4-34-1";

/** The hero's safe-vs-exposed contrast: bedside nursing 2.8 vs entry software 8.1. */
export function HeroContrast() {
  return (
    <div className="lp-contrast" aria-hidden="true">
      <div className="lp-contrast-item">
        <span className="lp-draw dual safe">
          2.8
          <svg viewBox="0 0 120 62" aria-hidden="true">
            <path d={HAND} />
          </svg>
        </span>
        <span className="lp-cap">
          <b>Bedside nursing</b>protected by hands, trust &amp; law
        </span>
      </div>
      <div className="lp-contrast-item">
        <span className="lp-draw dual delay">
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
  );
}
