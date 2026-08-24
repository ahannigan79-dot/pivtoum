import Link from "next/link";
import type { PlanStep } from "@/lib/plan";

/* The activation ledger — every step of the opening, with honest state.
 * Done steps read as earned; pending steps invite the next move. */
export function Checklist({ steps, done, total }: { steps: PlanStep[]; done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <section className="checklist">
      <div className="cl-head">
        <p className="ck">Your opening</p>
        <span className="cl-count">{done} of {total} underway</span>
      </div>
      <div className="cl-bar"><span style={{ width: `${pct}%` }} /></div>
      <ol className="cl-list">
        {steps.map((s) => (
          <li key={s.key} className={"cl-item" + (s.done ? " done" : "") + (s.locked ? " locked" : "")}>
            <span className="cl-mark" aria-hidden="true">{s.done ? "✓" : s.locked ? "🔒" : "○"}</span>
            <span className="cl-label">{s.label}</span>
            {s.done ? (
              <span className="cl-state">Done</span>
            ) : s.locked ? (
              <span className="cl-state muted">{s.lockNote}</span>
            ) : (
              <Link href={s.href} className="cl-go">{s.cta} →</Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
