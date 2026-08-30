"use client";
import { useState, useTransition } from "react";
import { submitCheckin } from "@/app/hub/pods/actions";

// The 2-minute weekly ritual: shipped / stuck / one move. Feeds the pod streak.
export function PodCheckin({ slug, checkedIn }: { slug: string; checkedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button className="checkin-open" onClick={() => setOpen(true)}>
        {checkedIn ? "✓ Checked in this week — update it" : "＋ Post your weekly check-in"}
      </button>
    );
  }

  return (
    <form className="checkin"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => { await submitCheckin(slug, fd); setOpen(false); });
      }}>
      <p className="checkin-title">Your weekly check-in</p>
      <label>✅ What you shipped<input name="shipped" maxLength={500} autoFocus
        placeholder="A move you made this week" /></label>
      <label>🧱 Where you&rsquo;re stuck<input name="stuck" maxLength={500}
        placeholder="Something the pod could help with" /></label>
      <label>➡️ Your one move this week<input name="move" maxLength={500}
        placeholder="The single thing you&rsquo;ll do" /></label>
      <div className="checkin-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post check-in"}</button>
      </div>
    </form>
  );
}
