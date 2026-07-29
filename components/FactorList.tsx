import type { Career } from "@/data/careers";

/**
 * The six-factor list. Each factor shows a bar scaled to its 0–10 rating,
 * coloured coral for exposure and green for protection (the site's highlight
 * palette). Exposure ratings also render in --pen.
 */
export function FactorList({ career }: { career: Career }) {
  return (
    <div>
      {career.factors.map((f, i) => {
        const cls = ["factor", i === 0 ? "first" : "", f.direction === "exposure" ? "up" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={i} className={cls}>
            <span>{f.question}</span>
            <span className="factor-bar" aria-hidden="true">
              <span className="factor-fill" style={{ width: `${f.rating * 10}%` }} />
            </span>
            <b>{f.rating.toFixed(1)}</b>
          </div>
        );
      })}
    </div>
  );
}
