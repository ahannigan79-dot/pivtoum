"use client";
import { useRef, useTransition } from "react";

export function MessageComposer({ action, name }: { action: (fd: FormData) => Promise<void>; name: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [pending, start] = useTransition();

  function submit() {
    const fd = new FormData(ref.current!);
    if (!String(fd.get("body") ?? "").trim()) return;
    start(async () => { await action(fd); ref.current?.reset(); taRef.current?.focus(); });
  }

  return (
    <form
      ref={ref}
      className="dm-composer"
      action={() => submit()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
      }}
    >
      <textarea ref={taRef} name="body" rows={2} required maxLength={4000}
        placeholder={`Message ${name}…`} />
      <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send"}</button>
    </form>
  );
}
