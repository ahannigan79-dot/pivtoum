"use client";
import { useEffect, useRef, useState } from "react";

/**
 * "Adam's read" — the member's personalised Map narrative. Fetched on mount so
 * the (few-second) first generation never blocks the dashboard SSR. Renders
 * nothing if AI is unconfigured or generation fails — the rest of the cockpit
 * stands on its own.
 */
export function MapRead() {
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");
  const [paras, setParas] = useState<string[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/hub/map/narrative");
        const data = (await res.json()) as { narrative: string | null };
        if (!alive) return;
        const text = (data.narrative ?? "").trim();
        if (!text) return setState("empty");
        setParas(text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean));
        setState("ready");
      } catch {
        if (alive) setState("empty");
      }
    })();
    return () => { alive = false; };
  }, []);

  if (state === "empty") return null;

  return (
    <section className="mapread">
      <p className="ck">Adam&apos;s read · your Map in plain words</p>
      {state === "loading" ? (
        <div className="mapread-load" aria-hidden="true">
          <span /><span /><span />
        </div>
      ) : (
        <div className="mapread-body">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </section>
  );
}
