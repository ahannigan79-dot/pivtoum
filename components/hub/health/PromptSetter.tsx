"use client";
import { useRef, useState, useTransition } from "react";
import { setPrompt } from "@/app/hub/health/actions";

export function PromptSetter({ current }: { current: { title: string; body: string } | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  return (
    <div className="wp-set">
      {current ? (
        <div className="wp-set-cur">
          <div>
            <b>{current.title}</b>
            <p>{current.body}</p>
          </div>
          {!open && <button className="wp-set-edit" onClick={() => setOpen(true)}>New prompt</button>}
        </div>
      ) : (
        !open && <button className="wp-set-edit solo" onClick={() => setOpen(true)}>+ Set this week&apos;s prompt</button>
      )}

      {open && (
        <form ref={ref} className="wp-set-form"
          action={(fd) => start(async () => { await setPrompt(fd); ref.current?.reset(); setOpen(false); })}>
          <input name="title" placeholder="Prompt title — e.g. “The one task you handed to AI this week”" required maxLength={160} />
          <textarea name="body" rows={3} required maxLength={1000}
            placeholder="Set the ask. What should members reflect on and post about this week?" />
          <div className="wp-set-foot">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={pending}>{pending ? "Posting…" : "Make it this week's prompt"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
