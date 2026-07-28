import type { ReactNode } from "react";
import type { Career } from "@/data/careers";

/**
 * One factor, worked through in full — a tinted box with a --pen left border.
 * The factor heading and its rating come from data; the reasoning is MDX children.
 */
export function WorkedExample({ career, children }: { career: Career; children: ReactNode }) {
  const factor = career.factors.find((f) => f.question === career.workedFactor);
  return (
    <div className="worked">
      <h3>One factor, worked through in full</h3>
      <p className="fine">
        <em>So you can see what the analysis actually looks like.</em>
      </p>
      <p>
        <strong>
          {career.workedFactor}
          {factor ? ` — rated ${factor.rating.toFixed(1)}` : ""}
        </strong>
      </p>
      {children}
    </div>
  );
}
