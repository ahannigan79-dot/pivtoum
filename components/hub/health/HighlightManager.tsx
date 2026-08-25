"use client";
import { useRef, useState, useTransition } from "react";
import { createHighlight, removeHighlight } from "@/app/hub/health/actions";
import type { Highlight } from "@/lib/highlights";

export function HighlightManager({ highlights }: { highlights: Highlight[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [delPending, startDel] = useTransition();

  return (
    <div className="hl-mgr">
      {highlights.length > 0 && (
        <div className="hl-list">
          {highlights.map((h) => (
            <div key={h.id} className="hl-item">
              <div className="hl-item-main">
                <b>{h.title}</b>
                <p>{h.body}</p>
                {h.attribution && <span className="hl-attr">— {h.attribution}</span>}
              </div>
              <button className="hl-del" disabled={delPending}
                onClick={() => { if (confirm("Remove this highlight?")) startDel(() => removeHighlight(h.id)); }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <form ref={ref} className="hl-form"
          action={(fd) => start(async () => { await createHighlight(fd); ref.current?.reset(); setOpen(false); })}>
          <input name="title" placeholder="Headline — e.g. “A win from the Audit pod”" required maxLength={160} />
          <textarea name="body" rows={2} required maxLength={600}
            placeholder="What happened — a member win, a standout question, a milestone. Keep it real and specific." />
          <input name="attribution" placeholder="Attribution — e.g. “Sarah M · Audit lane” (optional)" maxLength={120} />
          <div className="hl-form-foot">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={pending}>{pending ? "Adding…" : "Add highlight"}</button>
          </div>
        </form>
      ) : (
        <button className="hl-add" onClick={() => setOpen(true)}>+ Add a highlight</button>
      )}
      <p className="hl-hint">Non-members see up to four of these in the looking glass. When empty, they see live counts instead.</p>
    </div>
  );
}
