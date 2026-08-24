"use client";
import Link from "next/link";
import { useTransition } from "react";
import { markWelcomeBooked } from "@/app/hub/actions";
import type { PlanStep } from "@/lib/plan";

export function NextAction({ step, stepNum, total }: { step: PlanStep; stepNum: number; total: number }) {
  const [pending, start] = useTransition();
  return (
    <section className="nextact">
      <div className="nextact-body">
        <p className="ck">Do this next · leverage your opening</p>
        <h2>{step.label}</h2>
        <p className="nextact-blurb">{step.blurb}</p>
        <div className="nextact-cta">
          <Link href={step.href} className="btn-primary">{step.cta} →</Link>
          {step.key === "welcome" && (
            <button className="btn-ghost" disabled={pending} onClick={() => start(() => markWelcomeBooked())}>
              {pending ? "…" : "I've booked it"}
            </button>
          )}
        </div>
      </div>
      <div className="nextact-step">Step {stepNum} of {total}</div>
    </section>
  );
}
