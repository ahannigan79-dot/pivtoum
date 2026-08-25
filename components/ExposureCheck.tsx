"use client";
import { useMemo, useState } from "react";
import { PackageSignup } from "@/components/PackageSignup";
import { trackEvent } from "@/lib/analytics";
import { BAND_LABELS, type CheckResult } from "@/lib/exposure";

const TONE_COLOR: Record<string, string> = {
  red: "#E0776C", orange: "#D6A85B", yellow: "#DFD5A2", lime: "#A7CBA0", green: "#7FC08A",
};

export function ExposureCheck({ checks, careerOpts, preselect }: {
  checks: CheckResult[];
  careerOpts: { slug: string; name: string }[];
  preselect?: string;
}) {
  const sorted = useMemo(() => [...checks].sort((a, b) => a.name.localeCompare(b.name)), [checks]);
  const [slug, setSlug] = useState<string>(preselect && checks.some((c) => c.slug === preselect) ? preselect : "");
  const result = checks.find((c) => c.slug === slug) ?? null;

  function choose(next: string) {
    setSlug(next);
    if (next) trackEvent("exposure_check", { career: next });
  }

  return (
    <div className="chk">
      <div className="chk-pick">
        <label htmlFor="chk-role">Which role is closest to yours?</label>
        <select id="chk-role" value={slug} onChange={(e) => choose(e.target.value)}>
          <option value="">Choose your role…</option>
          {sorted.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {result && (
        <>
          <div className="chk-result">
            <div className="chk-band-lede">
              <span className="chk-k">Your AI exposure looks</span>
              <span className="chk-band-word" style={{ color: TONE_COLOR[result.band.tone] }}>{result.band.word}</span>
            </div>
            <p className="chk-phrase">Based on <b>{result.name}</b>, your work looks <b>{result.band.phrase}</b>.</p>

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
            <PackageSignup careers={careerOpts} preselect={slug} />
          </div>
        </>
      )}
    </div>
  );
}
