"use client";
import { useRef, useState, useTransition } from "react";
import { setPrompt, draftBrief } from "@/app/hub/health/actions";

type Current = { title: string; body: string } | null;

export function PromptSetter({ current, aiOn = false }: { current: Current; aiOn?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [drafting, startDraft] = useTransition();

  // Controlled so "Draft with Claude" can fill them; the founder always edits before posting.
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [articleSlug, setArticleSlug] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [draftErr, setDraftErr] = useState(false);

  function reset() {
    setTitle(""); setBody(""); setArticleSlug(null); setArticleTitle(null); setDraftErr(false);
  }
  function close() { setOpen(false); reset(); }

  function draft() {
    setDraftErr(false);
    startDraft(async () => {
      const d = await draftBrief();
      if (!d) { setDraftErr(true); return; }
      setTitle(d.title); setBody(d.body);
      setArticleSlug(d.articleSlug); setArticleTitle(d.articleTitle);
    });
  }

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
          action={(fd) => start(async () => { await setPrompt(fd); close(); })}>
          {aiOn && (
            <div className="wp-draft">
              <button type="button" className="wp-draft-btn" onClick={draft} disabled={drafting} aria-busy={drafting}>
                {drafting ? "Drafting…" : "✦ Draft with Claude"}
              </button>
              <span className="wp-draft-hint">Grounded in your latest article + what&apos;s landing. You edit before it posts.</span>
            </div>
          )}
          {draftErr && <p className="wp-draft-err">Couldn&apos;t draft one just now — write it below, or try again.</p>}

          <input name="title" placeholder="Prompt title — e.g. “The one task you handed to AI this week”" required maxLength={160}
            value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea name="body" rows={4} required maxLength={1000}
            placeholder="Set the ask. What should members reflect on and post about this week?"
            value={body} onChange={(e) => setBody(e.target.value)} />

          <input type="hidden" name="articleSlug" value={articleSlug ?? ""} />
          {articleTitle && (
            <div className="wp-draft-art">
              <span>Highlighting: <b>{articleTitle}</b></span>
              <button type="button" onClick={() => { setArticleSlug(null); setArticleTitle(null); }}>remove</button>
            </div>
          )}

          <div className="wp-set-foot">
            <button type="button" className="ghost" onClick={close}>Cancel</button>
            <button type="submit" disabled={pending}>{pending ? "Posting…" : "Make it this week's prompt"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
