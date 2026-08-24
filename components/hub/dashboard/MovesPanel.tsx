"use client";
import { useRef, useState, useTransition } from "react";
import { acceptSuggestion, createMove, dropMove, shipMove } from "@/app/hub/actions";
import { LEVERS, type Move, type Suggestion } from "@/lib/moves";

function fmtDue(d: Date | null): string {
  if (!d) return "";
  return "due " + new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MovesPanel({ active, shipped, suggestions }: { active: Move[]; shipped: Move[]; suggestions: Suggestion[] }) {
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [showShipped, setShowShipped] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  // Keep the Map's prescribed moves visible until they've been committed.
  const taken = new Set([...active, ...shipped].map((m) => m.title.trim().toLowerCase()));
  const fresh = suggestions.filter((s) => !taken.has(s.title.trim().toLowerCase()));

  return (
    <section className="moves">
      <div className="moves-head">
        <p className="ck">Your moves · pull the levers</p>
        {!adding && <button className="moves-add" onClick={() => setAdding(true)}>+ Commit to a move</button>}
      </div>

      {fresh.length > 0 && !adding && (
        <div className="moves-sugg">
          <p className="sugg-lead">From your Map — turn your winning move into action:</p>
          {fresh.map((s, i) => (
            <button key={i} className="sugg" disabled={pending}
              onClick={() => start(() => acceptSuggestion(s.title, s.lever))}>
              <span className="sugg-plus">+</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      )}

      {adding && (
        <form ref={ref} className="moves-form"
          action={(fd) => start(async () => { await createMove(fd); ref.current?.reset(); setAdding(false); })}>
          <input name="title" placeholder="What will you do? — e.g. Rebuild my weekly report AI-native" required maxLength={240} />
          <div className="moves-form-row">
            <select name="lever" defaultValue="renovate">
              {LEVERS.map((l) => <option key={l.slug} value={l.slug}>{l.label}</option>)}
            </select>
            <input name="dueAt" type="date" title="Target date — optional" />
          </div>
          <div className="moves-form-foot">
            <button type="button" className="ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" disabled={pending}>{pending ? "…" : "Commit"}</button>
          </div>
        </form>
      )}

      {active.length === 0 && !adding && fresh.length === 0 && (
        <p className="feed-empty">No moves in flight. Commit to one — it&apos;s how the score bends.</p>
      )}

      {active.length > 0 && (
        <ul className="moves-list">
          {active.map((m) => (
            <li key={m.id} className="move">
              <span className="move-lever">{m.leverLabel}</span>
              <span className="move-title">{m.title}</span>
              {m.dueAt && <span className="move-due">{fmtDue(m.dueAt)}</span>}
              <span className="move-actions">
                <button className="move-ship" disabled={pending} onClick={() => start(() => shipMove(m.id))}>Ship ✓</button>
                <button className="move-drop" disabled={pending} title="Drop" onClick={() => start(() => dropMove(m.id))}>×</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {shipped.length > 0 && (
        <div className="moves-shipped">
          <button className="shipped-toggle" onClick={() => setShowShipped((v) => !v)}>
            {shipped.length} shipped {showShipped ? "▲" : "▼"}
          </button>
          {showShipped && (
            <ul className="moves-list done">
              {shipped.map((m) => (
                <li key={m.id} className="move done">
                  <span className="move-lever">{m.leverLabel}</span>
                  <span className="move-title">{m.title}</span>
                  <span className="move-check">✓</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
