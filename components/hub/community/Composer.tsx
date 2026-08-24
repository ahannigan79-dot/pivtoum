"use client";
import { useRef, useTransition } from "react";
import { createPost } from "@/app/hub/community/actions";

export function Composer() {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  return (
    <form
      ref={ref}
      className="composer"
      action={(fd) => start(async () => { await createPost(fd); ref.current?.reset(); })}
    >
      <textarea name="body" rows={3} required maxLength={5000}
        placeholder="Share a win, a question, or what you're working on this week…" />
      <div className="composer-foot">
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post"}</button>
      </div>
    </form>
  );
}
