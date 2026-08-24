"use client";
import { useState, useTransition } from "react";

export function PrefsForm({ action, initial, email }: {
  action: (fd: FormData) => Promise<void>;
  initial: { emailInstant: boolean; emailDigest: boolean };
  email: string;
}) {
  const [instant, setInstant] = useState(initial.emailInstant);
  const [digest, setDigest] = useState(initial.emailDigest);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = instant !== initial.emailInstant || digest !== initial.emailDigest;

  return (
    <form
      className="prefs"
      action={(fd) => start(async () => { await action(fd); setSaved(true); })}
      onChange={() => setSaved(false)}
    >
      <label className="pref-row">
        <input type="checkbox" name="emailInstant" checked={instant} onChange={(e) => setInstant(e.target.checked)} />
        <span>
          <b>Replies &amp; messages</b>
          <small>Email me when someone replies to my post or sends me a direct message.</small>
        </span>
      </label>
      <label className="pref-row">
        <input type="checkbox" name="emailDigest" checked={digest} onChange={(e) => setDigest(e.target.checked)} />
        <span>
          <b>Weekly digest</b>
          <small>A once-a-week summary of what&apos;s waiting for you, what&apos;s coming up, and re-score reminders.</small>
        </span>
      </label>
      {email && <p className="prefs-to">Sending to <b>{email}</b></p>}
      <div className="prefs-foot">
        <button type="submit" disabled={pending || !dirty}>{pending ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}</button>
      </div>
    </form>
  );
}
