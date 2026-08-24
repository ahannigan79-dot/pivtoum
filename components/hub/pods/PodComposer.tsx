"use client";
import { useRef, useState, useTransition } from "react";
import { createPodPost } from "@/app/hub/pods/actions";

const EMOJI = ["🎉", "🔥", "💪", "🙌", "👏", "✅", "🤔", "❤️"];

export function PodComposer({ slug, threadId, placeholder, shareText }: {
  slug: string; threadId: string | null; placeholder?: string; shareText?: string | null;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);
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
      action={(fd) => start(async () => { await createPodPost(slug, threadId, fd); ref.current?.reset(); setFiles([]); })}
    >
      <textarea ref={taRef} name="body" rows={3} required maxLength={5000}
        placeholder={placeholder ?? "What did you commit to this week? Where are you stuck? Ask your pod… 🎉"} />
      <input ref={fileRef} type="file" name="files" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 4).map((f) => f.name))} />
      {files.length > 0 && <div className="attach-chips">{files.map((n, i) => <span key={i} className="attach-chip">📎 {n}</span>)}</div>}
      <div className="composer-foot">
        <div className="emoji-row">
          {EMOJI.map((e) => <button key={e} type="button" className="emoji-btn" onClick={() => addEmoji(e)}>{e}</button>)}
          <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()}>📎</button>
          {shareText && <button type="button" className="share-map-btn" onClick={shareMap}>📊 Share my Map</button>}
        </div>
        <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post to pod"}</button>
      </div>
    </form>
  );
}
