"use client";
import { useMemo, useState } from "react";
import { MapCapture } from "@/components/MapCapture";
import { trackEvent } from "@/lib/analytics";
import {
  BAND_LABELS, bandByStep, tunedStep, personalWhy,
  type CheckResult, type Seniority, type Routine,
} from "@/lib/exposure";

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

  return (
    <div className="chk">
      <div className="chk-pick">
        <label htmlFor="chk-role">Which role is closest to yours?</label>
        <select id="chk-role" value={slug} onChange={(e) => choose(e.target.value)}>
          <option value="">Choose your role…</option>
          {sorted.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
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

            <div className="chk-locked">
              <div className="chk-locked-rows">
                <span>🔒 Your exact exposure score</span>
                <span>🔒 Your winning strategy</span>
                <span>🔒 The moves that lower it</span>
              </div>
              <p className="chk-locked-cta">Unlock your full Career Map — and see your exact score — below ↓</p>
            </div>
          </div>

          <div className="chk-capture">
            <MapCapture
              careerSlug={slug}
              careerName={base!.name}
              stage={seniority === "student" ? "planning" : "active"}
            />
          </div>
        </>
      )}
    </div>
  );
}
