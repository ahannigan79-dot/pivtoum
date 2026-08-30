"use client";
import { useActionState, useState } from "react";
import { updateProfile, type UpdateResult } from "@/app/hub/members/actions";

const STAGES = ["Student", "Early-career", "Mid-career", "Senior", "Leader"];

export function ProfileEditor({ initial }: {
  initial: { displayName: string; handle: string | null; bio: string | null; stage: string | null; podIntro: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<UpdateResult | null, FormData>(
    async (prev, fd) => {
      const res = await updateProfile(prev, fd);
      if (res.ok) setOpen(false);
      return res;
    }, null);

  if (!open) return <button className="prof-edit" onClick={() => setOpen(true)}>Edit profile</button>;

  return (
    <form action={action} className="prof-form">
      <label>Display name<input name="displayName" defaultValue={initial.displayName} maxLength={80} /></label>
      <label>Handle<input name="handle" defaultValue={initial.handle ?? ""} placeholder="yourname" maxLength={30} /></label>
      <label>Career stage
        <select name="careerStage" defaultValue={initial.stage ?? ""}>
          <option value="">—</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>Bio<textarea name="bio" rows={3} defaultValue={initial.bio ?? ""} maxLength={600}
        placeholder="Where you are, where you're headed, what you're working on…" /></label>
      <label>Pod intro <span className="lbl-hint">— your teammates see this</span>
        <textarea name="podIntro" rows={2} defaultValue={initial.podIntro ?? ""} maxLength={240}
          placeholder="Your lane · what you're navigating · one thing you want from your pod" /></label>
      {state?.error && <p className="prof-err">{state.error}</p>}
      <div className="prof-form-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}
