"use client";
import { useState } from "react";
import { setLaneAction } from "@/app/hub/market/actions";
import type { LaneRow as Row } from "@/lib/baselines";

export function LaneRow({ row }: { row: Row }) {
  const current = row.override ?? row.observed ?? 0;
  const [val, setVal] = useState<string>(String(current));
  const n = Number(val);
  const shift = val !== "" && !Number.isNaN(n) ? Math.round(n) - current : 0;

  return (
    <form action={setLaneAction} className="lbrow">
      <input type="hidden" name="careerSlug" value={row.careerSlug} />
      <input type="hidden" name="lane" value={row.lane} />
      <input type="hidden" name="observed" value={row.observed ?? ""} />

      <div className="lb-head">
        <div>
          <b className="lb-lane">{row.lane}</b>
          <span className="lb-career">{row.career}</span>
        </div>
        <span className="lb-count">{row.members} member{row.members === 1 ? "" : "s"}</span>
      </div>

      <div className="lb-nums">
        <span className="lb-obs">Map baseline <b>{row.observed ?? "—"}</b></span>
        {row.override != null && <span className="lb-ov">Set to <b>{row.override}</b></span>}
      </div>

      <div className="lb-controls">
        <label className="lb-field">
          <span>Market baseline</span>
          <input type="number" name="baseline" min={3} max={97} value={val}
            onChange={(e) => setVal(e.target.value)} className="lb-input" />
        </label>
        <input type="text" name="note" placeholder="Why it moved (members see this)" className="lb-note" maxLength={140} />
        <button type="submit" className="lb-save">Re-score</button>
      </div>

      <div className="lb-foot">
        {shift !== 0 ? (
          <span className={"lb-preview " + (shift > 0 ? "up" : "down")}>
            {shift > 0 ? "▲" : "▼"} {Math.abs(shift)} pt{Math.abs(shift) === 1 ? "" : "s"} · {row.members} member{row.members === 1 ? "" : "s"} move, improvement carries
          </span>
        ) : (
          <span className="lb-preview none">No change</span>
        )}
        {row.override != null && (
          <button type="submit" name="clear" value="1" className="lb-clear">Reset to map baseline</button>
        )}
      </div>
    </form>
  );
}
