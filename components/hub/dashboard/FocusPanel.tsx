"use client";
import { useTransition } from "react";
import Link from "next/link";
import { toggleStep, dropGoal } from "@/app/hub/focus-actions";
import type { FocusGoal } from "@/lib/focus";

/** "Your focus" — the member's chosen plays with their how-to steps as a live
 *  checklist. Ticking a step calls the server action (which moves the score). */
export function FocusPanel({ goals }: { goals: FocusGoal[] }) {
  const [pending, start] = useTransition();
  if (!goals.length) return null;

  return (
    <section className="card focus-card">
      <div className="chead">
        <span className="eyebrow">Your focus</span>
        <Link className="link" href="/hub/playbook">Add a play →</Link>
      </div>
      <div className="focus-goals">
        {goals.map((g) => {
          const pct = g.total ? Math.round((g.doneCount / g.total) * 100) : 0;
          return (
            <div className="focus-goal" key={g.id}>
              <div className="focus-goal-head">
                <h3>{g.title}</h3>
                <span className="focus-prog">{g.doneCount}/{g.total}</span>
              </div>
              <div className="focus-bar"><i style={{ width: `${pct}%` }} /></div>
              <ul className="focus-steps">
                {g.steps.map((s) => (
                  <li className={s.done ? "done" : ""} key={s.id}>
                    <button className="focus-check" disabled={pending} aria-pressed={s.done}
                      aria-label={s.done ? "Mark step not done" : "Mark step done"}
                      onClick={() => start(() => { void toggleStep(s.id); })}>
                      {s.done ? "✓" : ""}
                    </button>
                    <div className="focus-step-body">
                      <span className="fs-t">{s.title}</span>
                      {s.detail && <span className="fs-d">{s.detail}</span>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="focus-goal-foot">
                <Link href={`/hub/playbook/${g.playSlug}`} className="link">Open the play →</Link>
                <button className="focus-drop" disabled={pending}
                  onClick={() => start(() => { void dropGoal(g.id); })}>Drop</button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="focus-note">Each step you finish strengthens the lever it&rsquo;s built on — and your exposure comes down with it.</p>
    </section>
  );
}
