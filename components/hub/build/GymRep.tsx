"use client";
import { useEffect, useRef, useState } from "react";
import { logBuildRep, recordGymScore } from "@/app/hub/actions";
import { scoreLine, reviewCost, scenarioPar, money, OVERTIME_PER_MIN, FAILURE_PATTERNS, type Scenario, type ScenarioKind } from "@/lib/gym";

type Choice = "ship" | "flag";
type Phase = "brief" | "judging" | "revealed";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// How each artifact kind is framed — the chrome that makes it read like the real thing.
const CHROME: Record<ScenarioKind, { icon: string; label: string }> = {
  document:    { icon: "📄", label: "Document" },
  email:       { icon: "✉️", label: "Email" },
  spreadsheet: { icon: "▦", label: "Spreadsheet" },
  ticket:      { icon: "🎫", label: "Ticket" },
  contract:    { icon: "§", label: "Contract" },
  code:        { icon: "‹∕›", label: "Pull request" },
  message:     { icon: "💬", label: "Message" },
  order:       { icon: "🧾", label: "Order" },
  memo:        { icon: "📝", label: "Memo" },
};
// Kinds whose content is code/tabular and reads best in monospace.
const MONO: Set<ScenarioKind> = new Set(["code", "spreadsheet", "order"]);

export function GymRep({ scenario }: { scenario: Scenario }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [choices, setChoices] = useState<Record<number, Choice>>({});
  const [secs, setSecs] = useState(0);
  const logged = useRef(false);
  const n = scenario.items.length;
  const judged = Object.keys(choices).length;
  const kind: ScenarioKind = scenario.kind ?? "document";
  const chrome = CHROME[kind];
  const mono = MONO.has(kind);
  const aiDid = scenario.aiDid
    ?? "AI generated this deliverable end-to-end — it looks finished and confident. You own the sign-off.";

  useEffect(() => {
    if (phase !== "judging") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function reset() { setChoices({}); setSecs(0); setPhase("brief"); logged.current = false; }
  function reveal() {
    setPhase("revealed");
    if (!logged.current) {
      logged.current = true;
      void logBuildRep(`gym:${scenario.slug}`);
      const right = scenario.items.reduce((acc, it, i) => acc + (choices[i] === it.verdict ? 1 : 0), 0);
      const pct = Math.round((100 * right) / scenario.items.length);
      void recordGymScore(scenario.slug, scenario.career, pct);
    }
  }

  const results = scenario.items.map((it, i) => {
    const choice = choices[i];
    return {
      it, i, choice,
      caught: it.verdict === "flag" && choice === "flag",
      missed: it.verdict === "flag" && choice === "ship",
      over: it.verdict === "ship" && choice === "flag",
      right: choice === it.verdict,
    };
  });
  const nCaught = results.filter((r) => r.caught).length;
  const nMissed = results.filter((r) => r.missed).length;
  const nOver = results.filter((r) => r.over).length;
  const missedCrit = results.filter((r) => r.missed && r.it.severity === "critical").length;
  const totalFlags = scenario.items.filter((it) => it.verdict === "flag").length;

  const par = scenarioPar(scenario);
  const overSecs = Math.max(0, secs - par);
  const liveOvertime = Math.round((overSecs / 60) * OVERTIME_PER_MIN);
  const cost = reviewCost(scenario, choices, secs);

  // The pinned "what you're checking against" panel — inputs + the AI's remit.
  const contextPanel = (
    <aside className="gym-context">
      <div className="gym-ctx-block">
        <p className="gym-ctx-k">The inputs</p>
        <div className="gym-ctx-brief">
          {scenario.brief.map((b, i) => (
            <div key={i} className="gym-ctx-bf"><span className="l">{b.l}</span><span className="v">{b.v}</span></div>
          ))}
        </div>
      </div>
      <div className="gym-ctx-block">
        <p className="gym-ctx-k">What the AI did</p>
        <p className="gym-ctx-ai">{aiDid}</p>
      </div>
    </aside>
  );

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
          <p className="gym-brief-ai"><span className="gym-ctx-k">What the AI did</span> {aiDid}</p>
          <button className="gym-cta" onClick={() => setPhase("judging")}>Start the rep — the clock starts ▸</button>
        </div>
      )}

      {phase === "judging" && (
        <>
          <div className={"gym-clockbar" + (overSecs > 0 ? " over" : "")}>
            <span className="gym-clock">{mmss(secs)}</span>
            <span className="gym-clab">
              {overSecs > 0
                ? <>over benchmark · <b className="gym-burn">+{money(liveOvertime)} and counting</b></>
                : <>benchmark {mmss(par)} · a human would be done by then</>}
            </span>
            <span className="gym-prog">{judged} / {n} reviewed</span>
          </div>

          <div className="gym-judge">
            <div className={`gym-artifact k-${kind}` + (mono ? " mono" : "")}>
              <div className="gym-artifact-head">
                <span className="gym-artifact-kind">{chrome.icon} {chrome.label}</span>
                <span className="gym-artifact-name">{scenario.artifact}</span>
                <span className="gym-artifact-tag">AI-generated · unreviewed</span>
              </div>
              <p className="gym-artifact-hint">This looks finished. Some of it is wrong, and nothing marks which — mark each part <b>Looks right</b> or <b>Flag</b> against the inputs.</p>
              <div className="gym-segs">
                {scenario.items.map((it, i) => (
                  <div key={i} className={"gym-seg" + (choices[i] ? ` j-${choices[i]}` : "")}>
                    <div className="gym-seg-main">
                      <span className="gym-seg-area">{it.area}
                        {it.mode && <span className={"gym-mode m-" + it.mode}>{it.mode === "fact" ? "Fact-check" : "Judgment call"}</span>}
                      </span>
                      <div className="gym-seg-out">{it.output}</div>
                    </div>
                    <div className="gym-seg-judge">
                      <button className={"gym-jb ok" + (choices[i] === "ship" ? " on" : "")}
                        onClick={() => setChoices((c) => ({ ...c, [i]: "ship" }))}>✓ Looks right</button>
                      <button className={"gym-jb flag" + (choices[i] === "flag" ? " on" : "")}
                        onClick={() => setChoices((c) => ({ ...c, [i]: "flag" }))}>⚑ Flag</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {contextPanel}
          </div>

          <button className="gym-cta" onClick={reveal} disabled={judged < n}>
            {judged < n ? `Review all ${n} to sign off` : "Sign off — reveal the verdicts ▸"}
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
            <div className={"gym-cost-card" + (cost.total === 0 ? " clean" : "")}>
              <div className="gym-cost-total">
                <span className="gym-cost-k">What this review cost</span>
                <span className="gym-cost-n">{money(cost.total)}</span>
              </div>
              <div className="gym-cost-break">
                <span>Shipped flaws <b>{money(cost.missed)}</b></span>
                <span>Over-flagging <b>{money(cost.over)}</b></span>
                <span>Time over benchmark <b>{money(cost.time)}</b></span>
              </div>
              <p className="gym-cost-note">
                Judged in {mmss(secs)} against a {mmss(par)} benchmark
                {cost.overSecs > 0 ? ` — ${mmss(cost.overSecs)} slow` : " — on pace"}.
                {cost.total === 0 ? " Nothing missed, nothing over-flagged, on time. That's the bar." : " Catch more, over-flag less, and beat the clock — that's the reviewer worth paying."}
              </p>
            </div>
          </div>

          <div className="gym-review">
            {results.map((r) => (
              <div key={r.i} className={"gym-rev " + (r.right ? "right" : "wrong")}>
                <div className="gym-rev-top">
                  <span className="gym-rev-area">{r.it.area}
                    {r.it.mode && <span className={"gym-mode m-" + r.it.mode}>{r.it.mode === "fact" ? "Fact-check" : "Judgment call"}</span>}
                  </span>
                  <span className={"gym-verdict v-" + r.it.verdict}>
                    {r.it.verdict === "flag" ? `⚑ Flag${r.it.severity ? ` · ${r.it.severity}` : ""}` : "✓ Ship"}
                    {r.right ? " · you got it" : r.missed ? " · you shipped it" : r.over ? " · you over-flagged" : ""}
                  </span>
                </div>
                <div className={"gym-out sm" + (mono ? " mono" : "")}>{r.it.output}</div>
                <p className="gym-why">{r.it.why}</p>
                {r.it.verdict === "flag" && r.it.pattern && (
                  <p className="gym-pattern">
                    <span className="gym-pattern-k">AI failure pattern · {FAILURE_PATTERNS[r.it.pattern].label}</span>
                    {FAILURE_PATTERNS[r.it.pattern].note}
                  </p>
                )}
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
