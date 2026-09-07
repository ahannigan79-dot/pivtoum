"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { verifyMove, returnMove } from "@/app/hub/artifact-actions";

type Item = {
  id: string; memberId: string; memberName: string; handle: string | null; playTitle: string;
  kind: "link" | "note"; url: string | null; body: string | null; domain: string | null;
};

export function ArtifactReview({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();
  const [returning, setReturning] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (items.length === 0) return <p className="muted">No moves waiting on you — you&rsquo;re clear.</p>;

  return (
    <div className="art-queue">
      {items.map((a) => (
        <div key={a.id} className="art-rev">
          <div className="art-rev-top">
            <span className="art-rev-who">
              <Link href={`/hub/members/${a.handle ?? a.memberId}`}>{a.memberName}</Link>
              {a.domain && <span className="art-rev-dom">{a.domain}</span>}
            </span>
            <span className="art-rev-play">{a.playTitle}</span>
          </div>
          {a.kind === "link" && a.url
            ? <a className="art-rev-link" href={a.url} target="_blank" rel="noopener noreferrer">🔗 Open the artifact →</a>
            : <p className="art-rev-note">{a.body}</p>}
          {returning === a.id ? (
            <div className="art-rev-return">
              <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} maxLength={400}
                placeholder="What's missing? (the member sees this)" />
              <button className="art-rev-send" disabled={pending}
                onClick={() => start(async () => { await returnMove(a.id, note); setReturning(null); setNote(""); })}>Send back</button>
              <button className="art-rev-x" onClick={() => { setReturning(null); setNote(""); }}>×</button>
            </div>
          ) : (
            <div className="art-rev-actions">
              <button className="art-rev-verify" disabled={pending} onClick={() => start(() => verifyMove(a.id))}>✓ Verify</button>
              <button className="art-rev-back" disabled={pending} onClick={() => setReturning(a.id)}>↩ Send back</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
