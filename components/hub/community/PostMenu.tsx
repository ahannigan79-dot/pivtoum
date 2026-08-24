"use client";
import { useState, useTransition } from "react";
import { deletePost, reportPost } from "@/app/hub/community/actions";

export function PostMenu({ postId, canDelete, canReport }: {
  postId: string; canDelete: boolean; canReport: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);
  const [pending, start] = useTransition();

  if (reported) return <span className="pm-flag">Reported ✓</span>;

  return (
    <div className="postmenu">
      <button className="pm-btn" aria-label="Post options" onClick={() => { setOpen((v) => !v); setReporting(false); }}>⋯</button>
      {open && !reporting && (
        <div className="pm-pop">
          {canReport && <button onClick={() => setReporting(true)}>⚑ Report to Adam</button>}
          {canDelete && (
            <button className="pm-del" disabled={pending}
              onClick={() => { if (confirm("Delete this post?")) start(() => deletePost(postId)); }}>
              🗑 Delete
            </button>
          )}
        </div>
      )}
      {open && reporting && (
        <div className="pm-pop pm-report">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
            placeholder="What's wrong with this post? (optional)" maxLength={500} />
          <div className="pm-report-foot">
            <button className="ghost" onClick={() => { setReporting(false); setOpen(false); }}>Cancel</button>
            <button disabled={pending}
              onClick={() => start(async () => { await reportPost(postId, reason); setReported(true); setOpen(false); })}>
              Send report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
