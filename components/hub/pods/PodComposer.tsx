"use client";
import { useRef, useTransition } from "react";
import { createPodPost } from "@/app/hub/pods/actions";

const EMOJI = ["🎉", "🔥", "💪", "🙌", "👏", "✅", "🤔", "❤️"];

export function PodComposer({ slug }: { slug: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [pending, start] = useTransition();

  function addEmoji(e: string) {
    const ta = taRef.current;
    if (!ta) return;
    ta.value += e;
    ta.focus();
  }

  return (
    <form
      ref={ref}
      className="composer"
      action={(fd) => start(async () => { await createPodPost(slug, fd); ref.current?.reset(); })}
    >
      <textarea ref={taRef} name="body" rows={3} required maxLength={5000}
        placeholder="What did you commit to this week? Where are you stuck? Ask your pod… 🎉" />
      <div className="composer-foot">
        <div className="emoji-row">
          {EMOJI.map((e) => <button key={e} type="button" className="emoji-btn" onClick={() => addEmoji(e)}>{e}</button>)}
        </div>
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post to pod"}</button>
      </div>
    </form>
  );
}
