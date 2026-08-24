"use client";
import { useRef, useState, useTransition } from "react";
import { createEvent } from "@/app/hub/events/actions";

export function NewEventForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  if (!open) return <button className="newevent-toggle" onClick={() => setOpen(true)}>+ New event</button>;

  return (
    <form ref={ref} className="newevent"
      action={(fd) => start(async () => { await createEvent(fd); ref.current?.reset(); setOpen(false); })}>
      <input name="title" placeholder="Event title" required maxLength={200} />
      <div className="newevent-row">
        <select name="type" defaultValue="deep_dive">
          <option value="deep_dive">Deep-dive week</option>
          <option value="clinic">Clinic</option>
          <option value="rescore">Re-score</option>
          <option value="welcome_1to1">1:1 Welcome</option>
          <option value="social">Social</option>
        </select>
        <input name="startsAt" type="datetime-local" required />
        <input name="durationMins" type="number" defaultValue={60} min={15} step={15} title="Minutes" />
      </div>
      <input name="joinUrl" placeholder="Join link (Zoom / Meet) — optional" maxLength={500} />
      <input name="recordingUrl" placeholder="Recording link — optional" maxLength={500} />
      <textarea name="description" rows={2} placeholder="Description — optional" maxLength={2000} />
      <div className="newevent-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Creating…" : "Create event"}</button>
      </div>
    </form>
  );
}
