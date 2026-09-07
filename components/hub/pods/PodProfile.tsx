"use client";
import { useState, useTransition } from "react";
import { setPodProfile } from "@/app/hub/pods/actions";
import { STRATEGIES, strategyMeta } from "@/lib/pod-strategy";

// US timezone bands — pods run live sessions, so members are matched for meetability.
const REGIONS = ["Eastern", "Central", "Mountain", "Pacific"];

export function PodProfile({ slug, vibe, crest, lane, region, strategy = "all", canEdit }: {
  slug: string; vibe: string | null; crest: string | null; lane: string | null; region: string | null; strategy?: string; canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <form className="pod-profile editing"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => { await setPodProfile(slug, fd); setEditing(false); });
        }}>
        <label>What this pod is about<textarea name="vibe" rows={3} defaultValue={vibe ?? ""} maxLength={400}
          placeholder="Who we are and our vibe — e.g. Mid-career finance folks turning AI exposure into an edge. Direct, weekly, no lurking." autoFocus /></label>
        <div className="pod-profile-row">
          <label>Crest<input name="crest" defaultValue={crest ?? ""} maxLength={8} placeholder="🎯" /></label>
          <label>Lane<input name="lane" defaultValue={lane ?? ""} maxLength={60} placeholder="Finance & Accounting" /></label>
          <label>Region
            <select name="region" defaultValue={region ?? ""}>
              <option value="">—</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <label>Win strategy <span className="lbl-hint">— the move this pod is aligned to; experience levels stay mixed</span>
          <select name="strategy" defaultValue={strategy}>
            {STRATEGIES.map((s) => <option key={s.key} value={s.key}>{s.label} — {s.blurb}</option>)}
          </select>
        </label>
        <div className="pod-profile-foot">
          <button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button>
          <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save pod profile"}</button>
        </div>
      </form>
    );
  }

  if (!vibe) {
    if (!canEdit) return null;
    return (
      <button className="pod-profile-set" onClick={() => setEditing(true)}>
        ✎ Set your pod profile — <span>describe the vibe so new members can find you</span>
      </button>
    );
  }

  return (
    <div className="pod-profile">
      <p className="pod-profile-vibe">{vibe}</p>
      <div className="pod-profile-meta">
        {lane && <span className="pod-tag">{lane}</span>}
        {strategy && strategy !== "all" && <span className={`pod-tag pod-strat s-${strategy}`}>{strategyMeta(strategy).crest} {strategyMeta(strategy).label}</span>}
        {region && <span className="pod-tag">{region} time</span>}
        {canEdit && <button className="pod-profile-edit" onClick={() => setEditing(true)}>Edit</button>}
      </div>
    </div>
  );
}
