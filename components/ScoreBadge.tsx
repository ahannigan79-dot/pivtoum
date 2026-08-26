import type { Career } from "@/data/careers";
import { headlineFlag } from "@/lib/tier";

/**
 * The hero stat — the headline score in the exposure palette (single-tone, no
 * drawn ellipse): protected green if low, exposed coral if high (split at 6.5).
 */
export function ScoreBadge({ career }: { career: Career }) {
  const flag = headlineFlag(career.headlineScore);
  return (
    <div className="score-badge">
      <span className={`score-badge-circle ${flag === "safe" ? "safe" : ""}`}>
        {career.headlineScore.toFixed(1)}
      </span>
      <span className="score-badge-label">
        <span className="k">AI exposure</span>
        <span className="d">where 10 is most at risk</span>
      </span>
    </div>
  );
}
