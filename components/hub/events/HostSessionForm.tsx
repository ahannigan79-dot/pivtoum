"use client";
import { useRef, useState, useTransition } from "react";
import { hostSession } from "@/app/hub/events/actions";

/** Pod-leader control: schedule a session for a pod you lead — kept to the pod,
 *  or opened to the whole room. The recording attaches after it runs. */
export function HostSessionForm({ pods }: { pods: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  if (!open) return <button className="newevent-toggle" onClick={() => setOpen(true)}>+ Host a session</button>;

  return (
    <form ref={ref} className="newevent"
      action={(fd) => start(async () => { await hostSession(fd); ref.current?.reset(); setOpen(false); })}>
      <input name="title" placeholder="Session title (name your SME guest here)" required maxLength={200} />
      <div className="newevent-row">
        <select name="type" defaultValue="pod_checkin">
          <option value="pod_checkin">Pod check-in</option>
          <option value="sme">SME session</option>
          <option value="open_stage">Open Stage</option>
          <option value="wins">Celebrate the Wins</option>
        </select>
        <input name="startsAt" type="datetime-local" required />
        <input name="durationMins" type="number" defaultValue={45} min={15} step={15} title="Minutes" />
      </div>
      <div className="newevent-row">
        <select name="podId" defaultValue={pods[0]?.id}>
          {pods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select name="scope" defaultValue="pod">
          <option value="pod">Just my pod</option>
          <option value="community">Whole community</option>
        </select>
      </div>
      <input name="joinUrl" placeholder="Google Meet link — optional" maxLength={500} />
      <textarea name="description" rows={2} placeholder="What's the session about? — optional" maxLength={2000} />
      <div className="newevent-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Scheduling…" : "Schedule session"}</button>
      </div>
    </form>
  );
}
