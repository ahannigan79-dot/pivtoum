"use client";
import { useRef, useState, useTransition } from "react";
import { setPrompt, draftBrief, type DraftArticleOut } from "@/app/hub/health/actions";

type Current = { title: string; body: string } | null;
export type ScoutSeed = { url: string; title: string; summary: string | null; source: string | null };

export function PromptSetter({ current, aiOn = false, seed = null }: { current: Current; aiOn?: boolean; seed?: ScoutSeed | null }) {
  const [open, setOpen] = useState(!!seed);
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [drafting, startDraft] = useTransition();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // The highlighted article (internal essay or external scouted piece).
  const [article, setArticle] = useState<DraftArticleOut>(
    seed ? { kind: "external", url: seed.url, title: seed.title, summary: seed.summary } : null,
  );
  const [draftErr, setDraftErr] = useState(false);

  function reset() { setTitle(""); setBody(""); setArticle(null); setDraftErr(false); }
  function close() { setOpen(false); reset(); }

  function draft() {
    setDraftErr(false);
    startDraft(async () => {
      // If a scouted article is pinned, draft around it; otherwise let Claude pick one of our essays.
      const featured = article?.kind === "external"
        ? { url: article.url, title: article.title, summary: article.summary, source: seed?.source ?? null }
        : null;
      const d = await draftBrief(featured);
      if (!d) { setDraftErr(true); return; }
      setTitle(d.title); setBody(d.body);
      if (d.article) setArticle(d.article);
    });
  }

  const draftLabel = drafting
    ? "Drafting…"
    : article?.kind === "external" ? "✦ Draft brief around this article" : "✦ Draft with Claude";

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
                {draftLabel}
              </button>
              <span className="wp-draft-hint">
                {article?.kind === "external"
                  ? "Builds the brief around your scouted article. You edit before it posts."
                  : "Grounded in your latest article + what’s landing. You edit before it posts."}
              </span>
            </div>
          )}
          {draftErr && <p className="wp-draft-err">Couldn&apos;t draft one just now — write it below, or try again.</p>}

          <input name="title" placeholder="Prompt title — e.g. “The one task you handed to AI this week”" required maxLength={160}
            value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea name="body" rows={4} required maxLength={1000}
            placeholder="Set the ask. What should members reflect on and post about this week?"
            value={body} onChange={(e) => setBody(e.target.value)} />

          {/* Article highlight — internal slug or external url/title/summary. */}
          <input type="hidden" name="articleSlug" value={article?.kind === "internal" ? article.slug : ""} />
          <input type="hidden" name="articleUrl" value={article?.kind === "external" ? article.url : ""} />
          <input type="hidden" name="articleTitle" value={article?.kind === "external" ? article.title : ""} />
          <input type="hidden" name="articleSummary" value={article?.kind === "external" ? (article.summary ?? "") : ""} />
          {article && (
            <div className="wp-draft-art">
              <span>
                Highlighting{article.kind === "external" ? " (scouted)" : ""}: <b>{article.title}</b>
              </span>
              <button type="button" onClick={() => setArticle(null)}>remove</button>
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
