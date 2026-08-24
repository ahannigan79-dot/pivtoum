"use client";
import { useRef, useTransition } from "react";
import { createPodPost } from "@/app/hub/pods/actions";

export function PodComposer({ slug }: { slug: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  return (
    <form
      ref={ref}
      className="composer"
      action={(fd) => start(async () => { await createPodPost(slug, fd); ref.current?.reset(); })}
    >
      <textarea name="body" rows={3} required maxLength={5000}
        placeholder="What did you commit to this week? Where are you stuck? Ask your pod…" />
      <div className="composer-foot">
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post to pod"}</button>
      </div>
    </form>
  );
}
