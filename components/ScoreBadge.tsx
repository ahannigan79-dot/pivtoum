import type { Career } from "@/data/careers";

/**
 * The hero stat — the headline score inside a big hand-drawn red ellipse, as on
 * the printed profile. One per page; the ellipse draws itself on load.
 */
export function ScoreBadge({ career }: { career: Career }) {
  return (
    <div className="score-badge">
      <span className="score-badge-circle">
        {career.headlineScore.toFixed(1)}
        <svg viewBox="0 0 120 62" aria-hidden="true">
          <path d="M96 12C78 3 40 4 22 16 4 28 9 47 30 55c21 8 60 4 74-9 12-11 6-27-16-35-10-4-25-4-34-1" />
        </svg>
      </span>
      <span className="score-badge-label">
        <span className="k">AI exposure</span>
        <span className="d">where 10 is most at risk</span>
      </span>
    </div>
  );
}
