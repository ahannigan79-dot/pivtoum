"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TransformDocView } from "@/components/hub/build/TransformDocView";
import { AiDisclaimer } from "@/components/legal/AiDisclaimer";
import { saveTransformDoc, shareTransform, unshareTransform } from "@/app/hub/build/rebuild/actions";
import type { Transformation } from "@/lib/workflow-transform";

const OWNERS: Transformation["rebuilt"][number]["owner"][] = ["AI", "Human", "AI + Human"];

/** Owner's view of their transform doc: read it, edit it in place, share it. */
export function OwnerTransform({ id, workflow, doc, when, shareToken }: {
  id: string; workflow: string; doc: Transformation; when: Date; shareToken: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState<Transformation>(doc);
  const [saving, startSave] = useTransition();
  const [token, setToken] = useState<string | null>(shareToken);
  const [sharing, startShare] = useTransition();
  const [copied, setCopied] = useState(false);

  // ---- edit helpers (edit in place; remove a row; strings + object rows) ----
  const setTop = (patch: Partial<Transformation>) => setDraft((d) => ({ ...d, ...patch }));
  const setStrAt = (key: "changes" | "peopleMove" | "measure", i: number, v: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].map((x, j) => (j === i ? v : x)) }));
  const delStrAt = (key: "changes" | "peopleMove" | "measure", i: number) =>
    setDraft((d) => ({ ...d, [key]: d[key].filter((_, j) => j !== i) }));

  function save() {
    startSave(async () => {
      const res = await saveTransformDoc(id, draft);
      if (res.ok) { setMode("view"); router.refresh(); }
    });
  }
  function cancel() { setDraft(doc); setMode("view"); }

  function makeLink() {
    startShare(async () => {
      const res = await shareTransform(id);
      if (res.token) setToken(res.token);
    });
  }
  function stopLink() {
    startShare(async () => { await unshareTransform(id); setToken(null); setCopied(false); });
  }
  const shareUrl = token && typeof window !== "undefined" ? `${window.location.origin}/r/${token}` : "";
  function copy() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (mode === "edit") {
    return (
      <div className="wt-editwrap">
        <div className="wt-editbar">
          <span className="wt-editbar-t">Editing — fix any “assumed — confirm” notes and tighten the wording before you share.</span>
          <div className="wt-editbar-btns">
            <button className="wt-btn ghost" onClick={cancel} disabled={saving}>Cancel</button>
            <button className="wt-btn primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>

        <div className="wt-edit">
          <label className="wt-e-field"><span>Title</span>
            <input className="wt-e-in" value={draft.title} maxLength={160} onChange={(e) => setTop({ title: e.target.value })} /></label>
          <label className="wt-e-field"><span>The opportunity (one line)</span>
            <textarea className="wt-e-ta" rows={2} value={draft.thesis} maxLength={300} onChange={(e) => setTop({ thesis: e.target.value })} /></label>

          <div className="wt-e-sect"><h4>The workflow today</h4>
            {draft.today.map((s, i) => (
              <div key={i} className="wt-e-row">
                <input className="wt-e-in" value={s.step} placeholder="step" onChange={(e) => setTop({ today: draft.today.map((x, j) => j === i ? { ...x, step: e.target.value } : x) })} />
                <div className="wt-e-2">
                  <input className="wt-e-in" value={s.who} placeholder="who" onChange={(e) => setTop({ today: draft.today.map((x, j) => j === i ? { ...x, who: e.target.value } : x) })} />
                  <input className="wt-e-in" value={s.time} placeholder="time" onChange={(e) => setTop({ today: draft.today.map((x, j) => j === i ? { ...x, time: e.target.value } : x) })} />
                </div>
                <button className="wt-e-del" title="Remove" onClick={() => setTop({ today: draft.today.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>

          <div className="wt-e-sect"><h4>Rebuilt AI-native</h4>
            {draft.rebuilt.map((s, i) => (
              <div key={i} className="wt-e-row">
                <div className="wt-e-2">
                  <input className="wt-e-in" value={s.step} placeholder="step" onChange={(e) => setTop({ rebuilt: draft.rebuilt.map((x, j) => j === i ? { ...x, step: e.target.value } : x) })} />
                  <select className="wt-e-sel" value={s.owner} onChange={(e) => setTop({ rebuilt: draft.rebuilt.map((x, j) => j === i ? { ...x, owner: e.target.value as Transformation["rebuilt"][number]["owner"] } : x) })}>
                    {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <textarea className="wt-e-ta" rows={2} value={s.detail} placeholder="what happens, who owns the call" onChange={(e) => setTop({ rebuilt: draft.rebuilt.map((x, j) => j === i ? { ...x, detail: e.target.value } : x) })} />
                <button className="wt-e-del" title="Remove" onClick={() => setTop({ rebuilt: draft.rebuilt.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>

          {(["changes", "peopleMove", "measure"] as const).map((key) => (
            <div key={key} className="wt-e-sect">
              <h4>{key === "changes" ? "What changes" : key === "peopleMove" ? "Where the people move up to" : "What to measure"}</h4>
              {draft[key].map((c, i) => (
                <div key={i} className="wt-e-row">
                  <textarea className="wt-e-ta" rows={2} value={c} onChange={(e) => setStrAt(key, i, e.target.value)} />
                  <button className="wt-e-del" title="Remove" onClick={() => delStrAt(key, i)}>✕</button>
                </div>
              ))}
            </div>
          ))}

          <div className="wt-e-sect"><h4>The gains</h4>
            {draft.value.map((v, i) => (
              <div key={i} className="wt-e-row">
                <input className="wt-e-in wt-e-narrow" value={v.area} placeholder="Speed / Cost / …" onChange={(e) => setTop({ value: draft.value.map((x, j) => j === i ? { ...x, area: e.target.value } : x) })} />
                <textarea className="wt-e-ta" rows={2} value={v.gain} onChange={(e) => setTop({ value: draft.value.map((x, j) => j === i ? { ...x, gain: e.target.value } : x) })} />
                <button className="wt-e-del" title="Remove" onClick={() => setTop({ value: draft.value.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>

          <div className="wt-e-sect"><h4>Risks &amp; safeguards</h4>
            {draft.risks.map((r, i) => (
              <div key={i} className="wt-e-row">
                <textarea className="wt-e-ta" rows={2} value={r.risk} placeholder="what could go wrong" onChange={(e) => setTop({ risks: draft.risks.map((x, j) => j === i ? { ...x, risk: e.target.value } : x) })} />
                <textarea className="wt-e-ta" rows={2} value={r.safeguard} placeholder="the human check" onChange={(e) => setTop({ risks: draft.risks.map((x, j) => j === i ? { ...x, safeguard: e.target.value } : x) })} />
                <button className="wt-e-del" title="Remove" onClick={() => setTop({ risks: draft.risks.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>

          <div className="wt-e-sect"><h4>Rollout</h4>
            {draft.rollout.map((r, i) => (
              <div key={i} className="wt-e-row">
                <input className="wt-e-in wt-e-narrow" value={r.phase} placeholder="First 30 days" onChange={(e) => setTop({ rollout: draft.rollout.map((x, j) => j === i ? { ...x, phase: e.target.value } : x) })} />
                <textarea className="wt-e-ta" rows={2} value={r.detail} onChange={(e) => setTop({ rollout: draft.rollout.map((x, j) => j === i ? { ...x, detail: e.target.value } : x) })} />
                <button className="wt-e-del" title="Remove" onClick={() => setTop({ rollout: draft.rollout.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="wt-editbar bottom">
          <button className="wt-btn ghost" onClick={cancel} disabled={saving}>Cancel</button>
          <button className="wt-btn primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wt-ownerview">
      <div className="wt-toolbar">
        <button className="wt-btn" onClick={() => { setDraft(doc); setMode("edit"); }}>✎ Edit</button>
        <button className="wt-btn" onClick={() => window.print()}>⎙ Print / PDF</button>
        {token ? (
          <div className="wt-share on">
            <span className="wt-share-lbl">Anyone with the link can view</span>
            <input className="wt-share-url" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
            <button className="wt-btn primary" onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</button>
            <button className="wt-btn ghost" onClick={stopLink} disabled={sharing}>Stop sharing</button>
          </div>
        ) : (
          <button className="wt-btn primary" onClick={makeLink} disabled={sharing}>{sharing ? "Creating…" : "🔗 Create share link"}</button>
        )}
      </div>
      <TransformDocView title={workflow} doc={doc} when={when} />
      <AiDisclaimer variant="full" />
    </div>
  );
}
