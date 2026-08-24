"use client";
import { useRef, useState, useTransition } from "react";
import { createThread } from "@/app/hub/pods/actions";

export function NewThreadForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  if (!open) return <button className="thread-new" onClick={() => setOpen(true)}>+ New thread</button>;

  return (
    <form ref={ref} className="thread-form"
      action={(fd) => start(async () => { await createThread(slug, fd); setOpen(false); })}>
      <input name="emoji" placeholder="💬" maxLength={4} className="thread-emoji" />
      <input name="name" placeholder="Thread name" required maxLength={80} className="thread-name" />
      <button type="submit" disabled={pending}>{pending ? "…" : "Create"}</button>
      <button type="button" className="ghost" onClick={() => setOpen(false)}>✕</button>
    </form>
  );
}
