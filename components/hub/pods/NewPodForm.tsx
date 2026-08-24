"use client";
import { useRef, useState, useTransition } from "react";
import { createPod } from "@/app/hub/pods/actions";

export function NewPodForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  if (!open) return <button className="newevent-toggle" onClick={() => setOpen(true)}>+ New pod</button>;

  return (
    <form ref={ref} className="newevent"
      action={(fd) => start(async () => { await createPod(fd); ref.current?.reset(); setOpen(false); })}>
      <input name="name" placeholder="Pod name — e.g. “Nurses · Fall 2026”" required maxLength={120} />
      <textarea name="description" rows={2} placeholder="Who's this pod for? What's the shared path? — optional" maxLength={500} />
      <div className="newevent-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Creating…" : "Create pod"}</button>
      </div>
    </form>
  );
}
