"use client";
import { useState, useTransition } from "react";
import { placeMember } from "@/app/hub/pods/actions";

type Suggested = {
  slug: string; name: string; crest: string | null; vibe: string | null;
  lane: string | null; region: string | null; memberCount: number; capacity: number;
};

export function PlaceFlow({ suggested, initialIntro, initialRegion }: {
  suggested: Suggested[]; initialIntro: string; initialRegion: string;
}) {
  const [intro, setIntro] = useState(initialIntro);
  const [region, setRegion] = useState(initialRegion);
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<string | null>(null); // which button is working

  function place(slug: string | null) {
    setTarget(slug ?? "__auto__");
    start(() => { void placeMember(slug, intro, region || null); });
  }

  return (
    <div className="place">
      <div className="place-you">
        <label>Which half of the US are you in? <span className="lbl-hint">— so your pod can meet live</span>
          <div className="place-bands">
            {["East", "West"].map((b) => (
              <button key={b} type="button" className={`place-band ${region === b ? "on" : ""}`}
                onClick={() => setRegion(b)}>{b}</button>
            ))}
          </div>
        </label>
        <label>A line for your teammates <span className="lbl-hint">— optional</span>
          <textarea rows={2} value={intro} maxLength={240} onChange={(e) => setIntro(e.target.value)}
            placeholder="Your lane · what you're navigating · one thing you want from your pod" />
        </label>
      </div>

      {suggested.length > 0 ? (
        <div className="place-list">
          {suggested.map((p) => (
            <div key={p.slug} className="place-card">
              <div className="place-card-top">
                <span className="place-crest">{p.crest ?? "👥"}</span>
                <div className="place-card-id">
                  <h3>{p.name}</h3>
                  <p className="place-card-meta">
                    {[p.lane, p.region && `${p.region} time`, `${p.memberCount}/${p.capacity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {p.vibe && <p className="place-card-vibe">{p.vibe}</p>}
              <button className="place-join" disabled={pending}
                onClick={() => place(p.slug)}>
                {pending && target === p.slug ? "Joining…" : "Join this pod"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="place-empty">No pods are open in your lane yet — tap below and we&rsquo;ll place you
          with the closest fit.</p>
      )}

      <button className="place-auto" disabled={pending} onClick={() => place(null)}>
        {pending && target === "__auto__" ? "Finding your pod…" : "Just place me →"}
      </button>
    </div>
  );
}
