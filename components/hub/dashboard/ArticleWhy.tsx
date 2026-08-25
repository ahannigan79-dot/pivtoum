"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The member's personalised "why this week's article matters to your lane" line.
 * Fetched on mount so it never blocks the dashboard; renders nothing when AI is
 * off, the member hasn't mapped, or generation fails.
 */
export function ArticleWhy() {
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/hub/article-relevance");
        const data = (await res.json()) as { note: string | null };
        if (alive) setNote((data.note ?? "").trim() || null);
      } catch {
        /* silent — the article link stands on its own */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="wp-why loading" aria-hidden="true"><span /></div>;
  if (!note) return null;
  return (
    <div className="wp-why">
      <span className="wp-why-k">Why this matters to you</span>
      <p>{note}</p>
    </div>
  );
}
