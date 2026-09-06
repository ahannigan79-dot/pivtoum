"use client";
import { useState, useTransition } from "react";
import { resolveLeadershipInterest } from "@/app/hub/leadership-actions";

type Item = { id: string; name: string; handle: string | null; role: string; domain: string | null; note: string | null };

/** Founder review of leadership interest — approve (a domain approval assigns the
 *  role) or decline. */
export function InterestReview({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();
  const [resolved, setResolved] = useState<Record<string, string>>({});

  function act(id: string, approve: boolean) {
    start(async () => { await resolveLeadershipInterest(id, approve); setResolved((r) => ({ ...r, [id]: approve ? "approved" : "declined" })); });
  }

  return (
    <div className="ir-list">
      {items.map((it) => (
        <div className="ir-item" key={it.id}>
          <div className="ir-head">
            <b>{it.name}</b>
            <span className="ir-role">{it.role === "domain" ? `Domain leader${it.domain ? ` · ${it.domain}` : ""}` : "Pod captain"}</span>
          </div>
          {it.note && <p className="ir-note">{it.note}</p>}
          {resolved[it.id] ? (
            <p className="ir-done">{resolved[it.id] === "approved" ? "✓ Approved" : "Declined"}</p>
          ) : (
            <div className="ir-acts">
              <button className="btn btn-primary" disabled={pending} onClick={() => act(it.id, true)}>Approve</button>
              <button className="btn btn-ghost" disabled={pending} onClick={() => act(it.id, false)}>Decline</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
