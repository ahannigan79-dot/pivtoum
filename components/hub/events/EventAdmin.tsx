"use client";
import { useRef, useState, useTransition } from "react";
import { updateEvent, deleteEvent } from "@/app/hub/events/actions";

export type EditableEvent = {
  id: string; title: string; type: string; startsAt: string | Date;
  durationMins: number | null; joinUrl: string | null; recordingUrl: string | null; description: string | null;
};

/** datetime-local wants "YYYY-MM-DDTHH:mm" in the viewer's local time. */
function toLocalInput(d: string | Date): string {
  const t = typeof d === "string" ? new Date(d) : d;
  const off = t.getTimezoneOffset() * 60000;
  return new Date(t.getTime() - off).toISOString().slice(0, 16);
}

export function EventAdmin({ event }: { event: EditableEvent }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [delPending, startDel] = useTransition();

  if (!editing) {
    return (
      <div className="event-admin">
        <button className="event-admin-btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="event-admin-btn del" disabled={delPending}
          onClick={() => { if (confirm("Delete this event? This can't be undone.")) startDel(() => deleteEvent(event.id)); }}>
          {delPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    );
  }

  return (
    <form ref={ref} className="newevent event-edit"
      action={(fd) => start(async () => { await updateEvent(event.id, fd); setEditing(false); })}>
      <input name="title" defaultValue={event.title} placeholder="Event title" required maxLength={200} />
      <div className="newevent-row">
        <select name="type" defaultValue={event.type}>
          <option value="deep_dive">Deep-dive week</option>
          <option value="clinic">Clinic</option>
          <option value="rescore">Re-score</option>
          <option value="welcome_1to1">1:1 Welcome</option>
          <option value="social">Social</option>
        </select>
        <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(event.startsAt)} required />
        <input name="durationMins" type="number" defaultValue={event.durationMins ?? 60} min={15} step={15} title="Minutes" />
      </div>
      <input name="joinUrl" defaultValue={event.joinUrl ?? ""} placeholder="Join link (Zoom / Meet) — optional" maxLength={500} />
      <input name="recordingUrl" defaultValue={event.recordingUrl ?? ""} placeholder="Recording link — optional" maxLength={500} />
      <textarea name="description" rows={2} defaultValue={event.description ?? ""} placeholder="Description — optional" maxLength={2000} />
      <div className="newevent-foot">
        <button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}
