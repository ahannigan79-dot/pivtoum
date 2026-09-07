"use client";
import { useEffect, useRef, useState } from "react";
import { logBuildRep, recordGymScore } from "@/app/hub/actions";
import { scoreLine, reviewCost, scenarioPar, money, OVERTIME_PER_MIN, FAILURE_PATTERNS, patternFor, type Scenario, type ScenarioKind } from "@/lib/gym";

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
  const role = scenario.role ?? "You're the human in the loop — the one whose name goes on it. Nothing ships without your call.";

  // Compact inline judgment control + mode chip — the annotation on the artifact.
  const modeChip = (m?: "fact" | "judgment") =>
    m ? <span className={"gym-mode m-" + m}>{m === "fact" ? "Fact-check" : "Judgment"}</span> : null;
  const Mark = (i: number) => (
    <div className="gym-mark">
      <button className={"gym-mk ok" + (choices[i] === "ship" ? " on" : "")} title="Looks right"
        aria-label="Looks right" onClick={() => setChoices((c) => ({ ...c, [i]: "ship" }))}>✓</button>
      <button className={"gym-mk flag" + (choices[i] === "flag" ? " on" : "")} title="Flag this"
        aria-label="Flag this" onClick={() => setChoices((c) => ({ ...c, [i]: "flag" }))}>⚑</button>
    </div>
  );

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
      <div className="gym-ctx-block gym-ctx-role">
        <p className="gym-ctx-k">Your role</p>
        <p className="gym-ctx-ai">{role}</p>
      </div>
      <div className="gym-ctx-block">
        <p className="gym-ctx-k">The inputs · what the work must match</p>
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
          <div className="gym-assign">
            <div className="gym-assign-head">
              <span className="gym-assign-eyebrow">● In your review queue</span>
              <span className="gym-assign-status">Awaiting your sign-off</span>
            </div>
            <div className="gym-assign-file">
              <span className="gym-assign-ficon" aria-hidden>{chrome.icon}</span>
              <div className="gym-assign-fmeta">
                <span className="gym-assign-fname">{scenario.artifact}</span>
                <span className="gym-assign-fsub">{chrome.label} · {scenario.client}</span>
              </div>
              <span className="gym-assign-stamp">Draft</span>
            </div>
            <div className="gym-flow">
              <div className="gym-flow-step done">
                <span className="gym-flow-dot">✓</span>
                <div className="gym-flow-txt"><b>AI drafted it</b><span>Full deliverable, start to finish</span></div>
              </div>
              <span className="gym-flow-arm" aria-hidden />
              <div className="gym-flow-step now">
                <span className="gym-flow-dot" />
                <div className="gym-flow-txt"><b>Your review</b><span>Sign off only what holds</span></div>
              </div>
              <span className="gym-flow-arm" aria-hidden />
              <div className="gym-flow-step">
                <span className="gym-flow-dot" />
                <div className="gym-flow-txt"><b>Released</b><span>Goes out under your name</span></div>
              </div>
            </div>
            <p className="gym-assign-note">
              You didn&rsquo;t prompt this. It landed on your desk finished — and that&rsquo;s how most AI shows up at work. You&rsquo;re <b>downstream</b> of a machine that already ran, not chatting with one. The skill isn&rsquo;t writing the request; it&rsquo;s catching what it got wrong before it ships.
            </p>
          </div>

          <p className="gym-thesis">{scenario.thesis}</p>

          <div className="gym-brief">
            <p className="gym-brief-t">The engagement · <span className="gym-client">{scenario.client}</span></p>
            <div className="gym-brief-grid">
              {scenario.brief.map((b, i) => (
                <div key={i} className="gym-bf"><span className="l">{b.l}</span><span className="v">{b.v}</span></div>
              ))}
            </div>
          </div>
          <p className="gym-brief-ai"><span className="gym-ctx-k">What the AI did</span> {aiDid}</p>
          <div className="gym-brief-cta">
            <button className="gym-cta" onClick={() => setPhase("judging")}>Open the file — the clock starts ▸</button>
            <span className="gym-brief-bench">A reviewer clears this in about {mmss(par)}</span>
          </div>
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
            <div className={`gym-artifact k-${kind}`}>
              <div className="gym-artifact-head">
                <span className="gym-artifact-kind">{chrome.icon} {chrome.label}</span>
                <span className="gym-artifact-name">{scenario.artifact}</span>
                <span className="gym-artifact-tag">Draft · AI-generated</span>
              </div>

              {kind === "email" ? (
                <div className="gym-mail">
                  <div className="gym-mail-row"><span>From</span><b>You</b></div>
                  <div className="gym-mail-row"><span>To</span><b>{scenario.client}</b></div>
                  <div className="gym-mail-row"><span>Subject</span><b>{scenario.artifact}</b></div>
                </div>
              ) : kind !== "code" && (
                <div className="gym-paper">
                  <span className="gym-paper-client">{scenario.client}</span>
                  <div className="gym-paper-sig">
                    <span>Prepared by <b>AI</b></span>
                    <span>Reviewed by <b className="pend">you — pending</b></span>
                  </div>
                </div>
              )}

              <p className="gym-artifact-hint">Nothing here is marked right or wrong — that&rsquo;s your call. Read it against the inputs on the right and mark each part <b>✓ looks right</b> or <b>⚑ flag</b>.</p>

              {(kind === "spreadsheet" || kind === "order") ? (
                <div className="gym-grid">
                  <div className="gym-grow head"><span>Line</span><span>Value</span><span /></div>
                  {scenario.items.map((it, i) => (
                    <div key={i} className={"gym-grow" + (choices[i] ? ` j-${choices[i]}` : "")}>
                      <span className="gc-label">{it.area}{modeChip(it.mode)}</span>
                      <span className="gc-val">{it.output}</span>
                      {Mark(i)}
                    </div>
                  ))}
                </div>
              ) : kind === "code" ? (
                <div className="gym-diff">
                  {scenario.items.map((it, i) => (
                    <div key={i} className={"gym-hunk" + (choices[i] ? ` j-${choices[i]}` : "")}>
                      <div className="gym-hunk-head"><span className="gh-file">{it.area}</span>{modeChip(it.mode)}{Mark(i)}</div>
                      <pre className="gym-code">{it.output}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gym-doc">
                  {scenario.items.map((it, i) => (
                    <div key={i} className={"gym-para" + (choices[i] ? ` j-${choices[i]}` : "")}>
                      <div className="gym-para-body">
                        <span className="gym-para-label">{it.area}{modeChip(it.mode)}</span>
                        <p className="gym-para-text">{it.output}</p>
                      </div>
                      {Mark(i)}
                    </div>
                  ))}
                </div>
              )}
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
                {(() => {
                  const pat = patternFor(r.it);
                  if (r.it.verdict === "flag") {
                    return (
                      <div className="gym-teach">
                        <p className="gym-teach-h">⚑ What AI got wrong{pat ? <> · <span className="gym-teach-pat">{FAILURE_PATTERNS[pat].label}</span></> : null}</p>
                        <p className="gym-why">{r.it.why}</p>
                        {pat && <p className="gym-pattern-note"><b>Why this is a common AI failure:</b> {FAILURE_PATTERNS[pat].note}</p>}
                      </div>
                    );
                  }
                  return <p className="gym-why"><b className="gym-ok-h">✓ Rightly left alone.</b> {r.it.why}</p>;
                })()}
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
