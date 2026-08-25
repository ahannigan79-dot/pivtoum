"use client";
import { useRef, useState, useTransition } from "react";
import { createPost } from "@/app/hub/community/actions";
import type { Topic } from "@/lib/feed-topics";

const EMOJI = ["🎉", "🔥", "💪", "🙌", "👏", "✅", "🤔", "❤️"];

export function Composer({ topics, shareText }: { topics: Topic[]; shareText?: string | null }) {
  const ref = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
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
    setOpen(true);
    ta.value = shareText + (ta.value ? "\n\n" + ta.value : "\n\n");
    ta.focus();
  }

  return (
    <form
      ref={ref}
      className={"composer" + (open ? " open" : "")}
      action={(fd) => start(async () => { await createPost(fd); ref.current?.reset(); setFiles([]); setOpen(false); })}
    >
      {open && (
        <div className="composer-row">
          <input name="title" placeholder="Add a title (optional)" maxLength={160} className="composer-title" />
          <select name="topic" defaultValue="" className="composer-topic">
            <option value="">General</option>
            {topics.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
          </select>
        </div>
      )}
      <textarea ref={taRef} name="body" rows={open ? 4 : 2} required maxLength={5000}
        onFocus={() => setOpen(true)}
        placeholder="Share a win, a question, or what you're working on this week…" />
      <input ref={fileRef} type="file" name="files" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
        onChange={(e) => { setOpen(true); setFiles(Array.from(e.target.files ?? []).slice(0, 4).map((f) => f.name)); }} />
      {open && files.length > 0 && <div className="attach-chips">{files.map((n, i) => <span key={i} className="attach-chip">📎 {n}</span>)}</div>}
      {open && (
        <div className="composer-foot">
          <div className="emoji-row">
            {EMOJI.map((e) => <button key={e} type="button" className="emoji-btn" onClick={() => addEmoji(e)}>{e}</button>)}
            <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()}>📎</button>
            {shareText && <button type="button" className="share-map-btn" onClick={shareMap}>📊 Share my Map</button>}
          </div>
          <button type="button" className="ghost" onClick={() => { ref.current?.reset(); setOpen(false); }}>Cancel</button>
          <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post"}</button>
        </div>
      )}
    </form>
  );
}
