"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { expressLeadershipInterest } from "@/app/hub/leadership-actions";

/** Onboarding prompt: register interest in leading a pod (captain) or a domain.
 *  Framed around the responsibility — deliberately never mentions any perk. */
export function LeadInterest({ interested }: { interested: string[] }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string[]>(interested);

  function register(role: "captain" | "domain") {
    if (done.includes(role)) return;
    start(async () => { await expressLeadershipInterest(role, null, null); setDone((d) => [...d, role]); });
  }

  return (
    <section className="card lead-interest">
      <p className="ck">Step up</p>
      <h3 className="li-title">Fancy helping lead?</h3>
      <p className="li-body">
        This community runs on members who step up — as a <b>pod captain</b> or a <b>domain leader</b>. It&rsquo;s a
        real responsibility, and the sharpest seat on the change.
      </p>
      {done.length > 0 ? (
        <p className="li-done">✓ Interest registered — we&rsquo;ll be in touch. No pressure either way.</p>
      ) : (
        <>
          <div className="li-actions">
            <button className="btn btn-primary" disabled={pending} onClick={() => register("captain")}>I&rsquo;d captain a pod →</button>
            <button className="btn btn-ghost" disabled={pending} onClick={() => register("domain")}>I&rsquo;d lead a domain →</button>
          </div>
          <Link href="/hub/leadership/about" className="li-learn">Read what it involves →</Link>
        </>
      )}
    </section>
  );
}
