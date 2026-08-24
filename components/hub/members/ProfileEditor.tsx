"use client";
import { useActionState, useState } from "react";
import { updateProfile, type UpdateResult } from "@/app/hub/members/actions";

export function ProfileEditor({ initial }: {
  initial: { displayName: string; handle: string | null; bio: string | null };
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
      <label>Bio<textarea name="bio" rows={3} defaultValue={initial.bio ?? ""} maxLength={600}
        placeholder="Where you are, where you're headed, what you're working on…" /></label>
      {state?.error && <p className="prof-err">{state.error}</p>}
      <div className="prof-form-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}
