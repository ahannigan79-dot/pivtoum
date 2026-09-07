import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { gymByLane, KIND_CHROME } from "@/lib/gym";
import { getBuildReps } from "@/lib/build";
import { monthProgress } from "@/lib/gym-gate";
import { activeCadenceMonth } from "@/lib/cadence-state";

export const metadata = { title: "Judgment Gym — Pivotum" };

export default async function GymLanding() {
  const { userId } = await auth();
  const [done, gate, month] = await Promise.all([
    getBuildReps(userId),
    monthProgress(userId),
    activeCadenceMonth(),
  ]);
  const lanes = gymByLane();
  const repsPct = Math.min(100, Math.round((gate.passed / gate.repsNeeded) * 100));
  const weeksPct = Math.min(100, Math.round((gate.weeksActive / gate.weeksNeeded) * 100));

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Judgment Gym</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">🥊 The Judgment Gym</p>
          <h2>The AI hands you polished work. Some of it is wrong.</h2>
          <p>Pick a rep. Judge each piece <b>Ship</b> or <b>Flag</b> at speed, then get scored on what you caught and what you shipped. This is Edge 2 — the judgment the machine can&apos;t hold. Train the reps in your own field; the month&apos;s focus sets the lens.</p>
          <Link href="/hub/build/gym/browse" className="build-hero-link">🗂 Browse the full catalogue by career →</Link>
        </div>

        <div className="gym-focus">
          <p className="ck">This month in the Gym · {month.subject}</p>
          <p>The community is training <b>{month.subject}</b> this month. Your reps stay in your field — bring that lens to them: {month.repsMuscle}</p>
        </div>

        <div className={"gymgate" + (gate.qualified ? " on" : "")}>
          <div className="gymgate-head">
            <p className="ck">This month · Effort Dividend</p>
            <span className="gymgate-status">
              {gate.qualified ? "Earned — one point off your exposure ✓" : "Pass 8 reps and show up 3 weeks to earn a point"}
            </span>
          </div>
          <div className="gymgate-bars">
            <div className="gymgate-bar">
              <div className="gymgate-bar-l"><b>{gate.passed}</b>/{gate.repsNeeded} reps passed <span>(≥75%)</span></div>
              <div className="gymgate-track"><span style={{ width: `${repsPct}%` }} /></div>
            </div>
            <div className="gymgate-bar">
              <div className="gymgate-bar-l"><b>{gate.weeksActive}</b>/{gate.weeksNeeded} weeks active</div>
              <div className="gymgate-track"><span style={{ width: `${weeksPct}%` }} /></div>
            </div>
          </div>
        </div>


        {lanes.map(({ lane, reps }) => {
          const doneCount = reps.filter((r) => done.has(`gym:${r.slug}`)).length;
          return (
            <div key={lane} className="gym-lane">
              <div className="gym-lane-head">
                <div className="hub-sectlabel">{lane}</div>
                <span className="gym-lane-count">{doneCount}/{reps.length} reps done</span>
              </div>
              <div className="hub-grid">
                {reps.map((s, i) => {
                  const chrome = KIND_CHROME[s.kind ?? "document"];
                  const isDone = done.has(`gym:${s.slug}`);
                  return (
                    <Link key={s.slug} href={`/hub/build/gym/${s.slug}`} className="gym-repcard">
                      <div className="gym-repcard-top">
                        <span className="gym-repcard-icon" aria-hidden>{chrome.icon}</span>
                        <span className="gym-repcard-rep">Rep {i + 1} · {chrome.label}</span>
                        <span className={"gym-status " + (isDone ? "ok" : "wait")}>
                          {isDone ? "Signed off ✓" : "In your queue"}
                        </span>
                      </div>
                      <h3 className="gym-repcard-title">{s.client}</h3>
                      <p className="gym-repcard-desc">{s.short}</p>
                      <span className="gym-repcard-open">{isDone ? "Run it again" : "Open the file"} →</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
