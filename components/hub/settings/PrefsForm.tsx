"use client";
import { useState, useTransition } from "react";

export function PrefsForm({ action, initial, email }: {
  action: (fd: FormData) => Promise<void>;
  initial: { emailInstant: boolean; emailDigest: boolean; dmPrivacy: "all" | "pods" | "none"; showMap: boolean };
  email: string;
}) {
  const [instant, setInstant] = useState(initial.emailInstant);
  const [digest, setDigest] = useState(initial.emailDigest);
  const [dm, setDm] = useState(initial.dmPrivacy);
  const [showMap, setShowMap] = useState(initial.showMap);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = instant !== initial.emailInstant || digest !== initial.emailDigest
    || dm !== initial.dmPrivacy || showMap !== initial.showMap;

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

      <div className="hub-sectlabel" style={{ marginTop: 22 }}>Privacy</div>
      <label className="pref-row pref-select">
        <span>
          <b>Who can message me</b>
          <small>Choose who&apos;s allowed to start a direct message with you.</small>
        </span>
        <select name="dmPrivacy" value={dm} onChange={(e) => setDm(e.target.value as typeof dm)}>
          <option value="all">Everyone</option>
          <option value="pods">Only my pod-mates</option>
          <option value="none">No one</option>
        </select>
      </label>
      <label className="pref-row">
        <input type="checkbox" name="showMap" checked={showMap} onChange={(e) => setShowMap(e.target.checked)} />
        <span>
          <b>Show my Map on my profile</b>
          <small>Let other members see your exposure score and winning move. Off keeps it private to you.</small>
        </span>
      </label>

      <div className="prefs-foot">
        <button type="submit" disabled={pending || !dirty}>{pending ? "Saving…" : saved ? "Saved ✓" : "Save preferences"}</button>
      </div>
    </form>
  );
}
