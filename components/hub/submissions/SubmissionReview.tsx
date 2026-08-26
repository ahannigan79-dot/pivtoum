"use client";
import { useState, useTransition } from "react";
import { approve, decline } from "@/app/hub/submissions/actions";

/** Founder review controls for one pending submission: approve it live, or
 *  decline with an optional note back to the member. */
export function SubmissionReview({ id }: { id: string }) {
  const [declining, setDeclining] = useState(false);
  const [pending, start] = useTransition();

  if (declining) {
    return (
      <form className="sub-decline"
        action={(fd) => start(async () => { await decline(id, fd); setDeclining(false); })}>
        <textarea name="note" rows={2} maxLength={1000}
          placeholder="A note back to the member — what to change, or why not now (optional)" />
        <div className="sub-decline-foot">
          <button type="button" className="ghost" onClick={() => setDeclining(false)}>Cancel</button>
          <button type="submit" className="sub-btn-decline" disabled={pending}>{pending ? "Sending…" : "Decline"}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="sub-actions">
      <button className="sub-btn-decline" onClick={() => setDeclining(true)} disabled={pending}>Decline</button>
      <form action={() => start(async () => { await approve(id); })}>
        <button type="submit" className="sub-btn-approve" disabled={pending}>{pending ? "Publishing…" : "Approve → publish"}</button>
      </form>
    </div>
  );
}
