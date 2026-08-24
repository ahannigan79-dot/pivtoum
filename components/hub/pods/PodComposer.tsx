"use client";
import { useRef, useTransition } from "react";
import { createPodPost } from "@/app/hub/pods/actions";

const EMOJI = ["🎉", "🔥", "💪", "🙌", "👏", "✅", "🤔", "❤️"];

export function PodComposer({ slug, threadId, placeholder, shareText }: {
  slug: string; threadId: string | null; placeholder?: string; shareText?: string | null;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [pending, start] = useTransition();

  function addEmoji(e: string) {
    const ta = taRef.current;
    if (!ta) return;
    ta.value += e;
    ta.focus();
  }
  function shareMap() {
    const ta = taRef.current;
    if (!ta || !shareText) return;
    ta.value = shareText + (ta.value ? "\n\n" + ta.value : "\n\n");
    ta.focus();
  }

  return (
    <form
      ref={ref}
      className="composer"
      action={(fd) => start(async () => { await createPodPost(slug, threadId, fd); ref.current?.reset(); })}
    >
      <textarea ref={taRef} name="body" rows={3} required maxLength={5000}
        placeholder={placeholder ?? "What did you commit to this week? Where are you stuck? Ask your pod… 🎉"} />
      <div className="composer-foot">
        <div className="emoji-row">
          {EMOJI.map((e) => <button key={e} type="button" className="emoji-btn" onClick={() => addEmoji(e)}>{e}</button>)}
          {shareText && <button type="button" className="share-map-btn" onClick={shareMap}>📊 Share my Map</button>}
        </div>
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post to pod"}</button>
      </div>
    </form>
  );
}
