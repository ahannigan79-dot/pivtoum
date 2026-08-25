"use client";
import { useEffect, useRef, useState } from "react";
import { logBuildRep } from "@/app/hub/actions";
import { scoreLine, type Scenario } from "@/lib/gym";

type Choice = "ship" | "flag";
type Phase = "brief" | "judging" | "revealed";

export function GymRep({ scenario }: { scenario: Scenario }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [choices, setChoices] = useState<Record<number, Choice>>({});
  const [secs, setSecs] = useState(0);
  const logged = useRef(false);
  const n = scenario.items.length;
  const judged = Object.keys(choices).length;

  useEffect(() => {
    if (phase !== "judging") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function reset() {
    setChoices({}); setSecs(0); setPhase("brief"); logged.current = false;
  }
  function reveal() {
    setPhase("revealed");
    if (!logged.current) { logged.current = true; void logBuildRep(`gym:${scenario.slug}`); }
  }

  // Results
  const results = scenario.items.map((it, i) => {
    const choice = choices[i];
    const correct = it.verdict;
    return {
      it, i, choice,
      caught: correct === "flag" && choice === "flag",
      missed: correct === "flag" && choice === "ship",
      over: correct === "ship" && choice === "flag",
      right: choice === correct,
    };
  });
  const nCaught = results.filter((r) => r.caught).length;
  const nMissed = results.filter((r) => r.missed).length;
  const nOver = results.filter((r) => r.over).length;
  const missedCrit = results.filter((r) => r.missed && r.it.severity === "critical").length;
  const totalFlags = scenario.items.filter((it) => it.verdict === "flag").length;
  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="gym">
      {phase === "brief" && (
        <div className="gym-brief-wrap">
          <p className="gym-thesis">{scenario.thesis}</p>
          <div className="gym-brief">
            <p className="gym-brief-t">The brief · <span className="gym-client">{scenario.client}</span></p>
            <div className="gym-brief-grid">
              {scenario.brief.map((b, i) => (
                <div key={i} className="gym-bf"><span className="l">{b.l}</span><span className="v">{b.v}</span></div>
              ))}
            </div>
          </div>
          <button className="gym-cta" onClick={() => setPhase("judging")}>Start the rep — the clock starts ▸</button>
        </div>
      )}

      {phase === "judging" && (
        <>
          <div className="gym-clockbar">
            <span className="gym-clock">{mmss}</span>
            <span className="gym-clab">judging at speed</span>
            <span className="gym-prog">{judged} / {n} judged</span>
          </div>
          <p className="gym-aihead"><b>{scenario.artifact}</b> — generated, ready for your sign-off.</p>
          <div className="gym-items">
            {scenario.items.map((it, i) => (
              <div key={i} className={"gym-item" + (choices[i] ? " done" : "")}>
                <div className="gym-area"><span className="gym-num">{String(i + 1).padStart(2, "0")}</span> {it.area}</div>
                <div className="gym-out">{it.output}</div>
                <div className="gym-choice">
                  <button className={"gym-cb ship" + (choices[i] === "ship" ? " on" : "")}
                    onClick={() => setChoices((c) => ({ ...c, [i]: "ship" }))}>✓ Ship it</button>
                  <button className={"gym-cb flag" + (choices[i] === "flag" ? " on" : "")}
                    onClick={() => setChoices((c) => ({ ...c, [i]: "flag" }))}>⚑ Flag it</button>
                </div>
              </div>
            ))}
          </div>
          <button className="gym-cta" onClick={reveal} disabled={judged < n}>
            {judged < n ? `Judge all ${n} to reveal` : "Reveal the verdicts ▸"}
          </button>
        </>
      )}

      {phase === "revealed" && (
        <>
          <div className="gym-scorecard">
            <span className="gym-kk">Your judgment, scored</span>
            <h2 className={missedCrit > 0 ? "bad" : nMissed === 0 && nOver === 0 ? "ok" : ""}>{scoreLine(missedCrit, nMissed, nOver)}</h2>
            <div className="gym-stats">
              <div className="gym-st caught"><div className="gym-n">{nCaught}/{totalFlags}</div><div className="gym-l">Buried flaws caught</div></div>
              <div className="gym-st missed"><div className="gym-n">{nMissed}</div><div className="gym-l">Flaws you shipped</div></div>
              <div className="gym-st over"><div className="gym-n">{nOver}</div><div className="gym-l">Good work over-flagged</div></div>
            </div>
            <p className="gym-time">Judged in {mmss}.</p>
          </div>

          <div className="gym-review">
            {results.map((r) => (
              <div key={r.i} className={"gym-rev " + (r.right ? "right" : "wrong")}>
                <div className="gym-rev-top">
                  <span className="gym-rev-area">{r.it.area}</span>
                  <span className={"gym-verdict v-" + r.it.verdict}>
                    {r.it.verdict === "flag" ? `⚑ Flag${r.it.severity ? ` · ${r.it.severity}` : ""}` : "✓ Ship"}
                    {r.right ? " · you got it" : r.missed ? " · you shipped it" : r.over ? " · you over-flagged" : ""}
                  </span>
                </div>
                <div className="gym-out sm">{r.it.output}</div>
                <p className="gym-why">{r.it.why}</p>
                <p className="gym-cost"><b>Cost of the wrong call:</b> {r.it.cost}</p>
                <p className="gym-trains">Trains: {r.it.trains}</p>
              </div>
            ))}
          </div>

          <p className="gym-lesson">{scenario.lesson}</p>
          <button className="gym-cta ghost" onClick={reset}>Run the rep again ▸</button>
        </>
      )}
    </div>
  );
}
