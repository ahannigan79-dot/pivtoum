"use client";
import { useEffect, useRef, useState } from "react";

/**
 * "Why this matters to you" for the lead signal — a one-line, lane-tied read of
 * the week's top AI story for this member. Fetched on mount so it never blocks
 * the dashboard; renders nothing when AI is off, the member hasn't mapped, or
 * generation fails.
 */
export function SignalWhy() {
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/hub/signal-relevance");
        const data = (await res.json()) as { note: string | null };
        if (alive) setNote((data.note ?? "").trim() || null);
      } catch {
        /* silent — the article stands on its own */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="wp-why sig-why loading" aria-hidden="true"><span /></div>;
  if (!note) return null;
  return (
    <div className="wp-why sig-why">
      <span className="wp-why-k">Why this matters to you</span>
      <p>{note}</p>
    </div>
  );
}
