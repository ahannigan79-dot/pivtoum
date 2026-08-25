"use client";
import { useEffect, useRef, useState } from "react";

type Section = { heading: string; body: string };
type Doc = { sample: string; sections: Section[] };

function Paras({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((p, i) => <p key={i}>{p.trim()}</p>)}</>;
}

/**
 * Renders a career Deep Dive. Fetches (and, first time, generates) it client-side
 * so the one-time generation shows a friendly building state instead of blocking.
 */
export function DeepDiveReader({ slug, samplerUrl }: { slug: string; samplerUrl: string | null }) {
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");
  const [doc, setDoc] = useState<Doc | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/hub/deepdive?slug=${encodeURIComponent(slug)}`);
        const data = (await res.json()) as { doc: Doc | null };
        if (!alive) return;
        if (!data.doc) return setState("empty");
        setDoc(data.doc);
        setState("ready");
      } catch {
        if (alive) setState("empty");
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  if (state === "loading") {
    return (
      <div className="dd-load">
        <div className="dd-spinner" aria-hidden="true" />
        <p>Building your Deep Dive — reading the field, the scores, and the trajectory. This takes a moment the first time; after that it&rsquo;s instant.</p>
      </div>
    );
  }
  if (state === "empty" || !doc) {
    return <p className="feed-empty">This Deep Dive isn&rsquo;t available yet. Check back shortly.</p>;
  }

  return (
    <div className="dd">
      <section className="dd-sample">
        <p className="ck">Free sample · the picture in brief</p>
        <div className="dd-sample-body"><Paras text={doc.sample} /></div>
        {samplerUrl && (
          <a className="dd-pdf" href={samplerUrl} target="_blank" rel="noopener noreferrer">Download the one-page PDF sample ↗</a>
        )}
      </section>

      <div className="hub-sectlabel">The Deep Dive</div>
      <div className="dd-body">
        {doc.sections.map((s, i) => (
          <section key={i} className="dd-sect">
            <h3>{s.heading}</h3>
            <Paras text={s.body} />
          </section>
        ))}
      </div>
    </div>
  );
}
