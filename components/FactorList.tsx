import type { Career } from "@/data/careers";

/** The six-factor list. Exposure factors render their rating in --pen (class up). */
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
            <b>{f.rating.toFixed(1)}</b>
          </div>
        );
      })}
    </div>
  );
}
