"use client";
import { useMemo, useState } from "react";
import { MapCapture } from "@/components/MapCapture";
import { RoleSelect } from "@/components/RoleSelect";
import { trackEvent } from "@/lib/analytics";
import {
  BAND_LABELS, bandByStep, tunedStep, personalWhy, tunedScore, scoreFactors,
  type CheckResult, type Seniority, type Routine,
} from "@/lib/exposure";
import { SITE } from "@/lib/site";

// Brand exposure palette — legible on the light paper ground both as the band
// word (text) and as the filled scale segment (with white text). Exposed coral →
// amber → protected green, matching the hub's data colors.
const TONE_COLOR: Record<string, string> = {
  red: "#B4442F", orange: "#BC6A2C", yellow: "#B8873A", lime: "#5F8A4C", green: "#2E7D55",
};

const SENIORITY: { key: Seniority; label: string }[] = [
  { key: "student", label: "Studying" }, { key: "early", label: "Early-career" },
  { key: "mid", label: "Mid-career" }, { key: "senior", label: "Senior" }, { key: "leader", label: "Leader" },
];
const ROUTINE: { key: Routine; label: string }[] = [
  { key: "repeatable", label: "Mostly repeatable" }, { key: "mix", label: "A mix" },
  { key: "judgment", label: "Mostly judgment" },
];

export function ExposureCheck({ checks, preselect }: {
  checks: CheckResult[];
  preselect?: string;
}) {
  const sorted = useMemo(() => [...checks].sort((a, b) => a.name.localeCompare(b.name)), [checks]);
  const [slug, setSlug] = useState<string>(preselect && checks.some((c) => c.slug === preselect) ? preselect : "");
  const [seniority, setSeniority] = useState<Seniority | "">("");
  const [routine, setRoutine] = useState<Routine | "">("");
  const [unlocked, setUnlocked] = useState(false);
  const base = checks.find((c) => c.slug === slug) ?? null;
  const ready = base && seniority && routine;

  function choose(next: string) {
    setSlug(next);
    if (next) trackEvent("exposure_check", { career: next });
  }

  // Personalised result once both taps are answered.
  const result = ready
    ? (() => {
        const band = bandByStep(tunedStep(base!.band.step, seniority as Seniority, routine as Routine));
        const pw = personalWhy(seniority as Seniority, routine as Routine);
        return {
          name: base!.name, band,
          expose: [...pw.expose, ...base!.expose].slice(0, 3),
          protect: [...pw.protect, ...base!.protect].slice(0, 2),
        };
      })()
    : null;

  // The exact score + the 4 driving factors — revealed on-page once a deliverable
  // email is captured (the email echoes the same). Higher = more exposed.
  const score = ready ? tunedScore(base!.headlineScore, seniority as Seniority, routine as Routine) : null;
  const factors = ready ? scoreFactors(base!, seniority as Seniority, routine as Routine) : [];
  const scoreColor = score == null ? undefined : score >= 60 ? TONE_COLOR.red : score <= 39 ? TONE_COLOR.green : TONE_COLOR.yellow;

  return (
    <div className="chk">
      <div className="chk-pick">
        <span className="chk-pick-label">Which role is closest to yours?</span>
        <RoleSelect options={sorted} value={slug} onChange={choose} />
      </div>

      {base && (
        <div className="chk-taps">
          <div className="chk-tap">
            <span className="chk-tap-q">Where are you in your career?</span>
            <div className="chk-tap-row">
              {SENIORITY.map((o) => (
                <button key={o.key} type="button" className={"chk-tap-btn" + (seniority === o.key ? " on" : "")}
                  onClick={() => setSeniority(o.key)} aria-pressed={seniority === o.key}>{o.label}</button>
              ))}
            </div>
          </div>
          <div className="chk-tap">
            <span className="chk-tap-q">How much of your work is routine vs judgment?</span>
            <div className="chk-tap-row">
              {ROUTINE.map((o) => (
                <button key={o.key} type="button" className={"chk-tap-btn" + (routine === o.key ? " on" : "")}
                  onClick={() => setRoutine(o.key)} aria-pressed={routine === o.key}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="chk-result">
            <div className="chk-band-lede">
              <span className="chk-k">Your AI exposure looks</span>
              <span className="chk-band-word" style={{ color: TONE_COLOR[result.band.tone] }}>{result.band.word}</span>
            </div>
            <p className="chk-phrase">Based on <b>{result.name}</b> and your answers, your work looks <b>{result.band.phrase}</b>.</p>

            <div className="chk-scale" aria-hidden="true">
              {BAND_LABELS.map((label, i) => (
                <span key={label}
                  className={"chk-seg" + (i === result.band.step ? " on" : "")}
                  style={i === result.band.step ? { background: TONE_COLOR[result.band.tone], borderColor: TONE_COLOR[result.band.tone] } : undefined}>
                  {label}
                </span>
              ))}
            </div>

            {/* The qualitative read — replaced by the tagged "4 factors" once unlocked. */}
            {!unlocked && (
              <div className="chk-why">
                {result.expose.length > 0 && (
                  <div className="chk-why-col">
                    <span className="chk-why-h expose">What&apos;s exposing you</span>
                    <ul>{result.expose.map((l, i) => <li key={i}>{l}</li>)}</ul>
                  </div>
                )}
                {result.protect.length > 0 && (
                  <div className="chk-why-col">
                    <span className="chk-why-h protect">What&apos;s on your side</span>
                    <ul>{result.protect.map((l, i) => <li key={i}>{l}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {!unlocked && (
              <p className="chk-locked-cta">Get your detailed score and the reason why, below ↓</p>
            )}

            {unlocked && score != null && (
              <div className="chk-unlocked">
                <div className="chk-score">
                  <span className="chk-score-n" style={{ color: scoreColor }}>{score}<i>/100</i></span>
                  <span className="chk-score-cap">Your exposure score · <b>{result.name}</b><br />Higher means more exposed to what AI can already do.</span>
                </div>

                <div className="chk-factors">
                  <span className="chk-k">The 4 factors driving it</span>
                  <ul>
                    {factors.map((f, i) => (
                      <li key={i} className={f.kind === "expose" ? "fx-expose" : "fx-protect"}>
                        <span className="fx-tag">{f.kind === "expose" ? "Exposing you" : "On your side"}</span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="chk-opp">
                  <span className="chk-opp-k">You came here out of concern — here&rsquo;s the opportunity</span>
                  <p className="chk-opp-h">This is your <b>starting line</b>, not your verdict.</p>
                  <div className="chk-journey" aria-hidden="true">
                    <span className="cjn-now">
                      <b style={{ color: scoreColor }}>{score}</b>
                      <i>you, today</i>
                    </span>
                    <span className="cjn-track"><span className="cjn-arrow">→</span></span>
                    <span className="cjn-goal">
                      <b>DOWN</b>
                      <i>every month<br />you do the work</i>
                    </span>
                  </div>
                  <p className="chk-opp-p">
                    The shift that exposed your work is the same one opening the ground for whoever moves first.
                    Inside <b>Winning in the Age of AI</b>, your Map re-scores as you do the reps and a pod in your
                    exact lane keeps you at it — so this number comes down and you come out ahead.
                  </p>
                  <div className="chk-opp-cta">
                    <a className="scr-btn" href={SITE.join}>Start your free trial →</a>
                    <a className="scr-btn ghost" href="/community">See everything inside →</a>
                  </div>
                  <p className="chk-opp-fine">Your score, the 28-career index, and the community guide are on their way to your inbox.</p>
                </div>
              </div>
            )}
          </div>

          {!unlocked && (
            <div className="chk-capture">
              <MapCapture
                careerSlug={slug}
                careerName={base!.name}
                stage={seniority === "student" ? "planning" : "active"}
                score={score ?? undefined}
                factors={factors}
                onUnlock={() => setUnlocked(true)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
