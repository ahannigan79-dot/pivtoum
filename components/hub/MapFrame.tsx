"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Payload = { answers: unknown; computed: unknown; overall: number | null };
type Status = "idle" | "saving" | "saved" | "error";

/** Embeds the Winning Map. Restores a saved map for returning members, and when
 *  the map produces a result, a bar invites them to approve & save it. */
export function MapFrame({ savedAnswers = null, rescoreDue = false }: { savedAnswers?: unknown; rescoreDue?: boolean }) {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

  // Hand the saved map to the tool once the iframe loads, so it greets the
  // returning member and can restore their full map.
  function onFrameLoad() {
    if (savedAnswers && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage({ type: "pivotum:restore", answers: savedAnswers, rescoreDue }, "*");
    }
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || d.type !== "pivotum:map") return;
      setPayload({ answers: d.answers, computed: d.computed, overall: d.overall });
      // A fresh result re-arms the save bar (e.g. after tuning), unless mid-save.
      if (statusRef.current !== "saving") setStatus("idle");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function save() {
    if (!payload) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/hub/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("saved");
      setTimeout(() => { router.push("/hub"); router.refresh(); }, 900);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mapframe-wrap">
      <iframe ref={frameRef} src="/tools/winning-map.html" title="Your Winning Map" className="mapframe" onLoad={onFrameLoad} />

      {payload && (
        <div className={"mapsave " + status}>
          {status === "saved" ? (
            <span className="mapsave-msg"><b>Saved ✓</b> Loading your dashboard…</span>
          ) : status === "error" ? (
            <>
              <span className="mapsave-msg">Couldn&apos;t save your Map. Check your connection and try again.</span>
              <button className="mapsave-btn" onClick={save}>Retry</button>
            </>
          ) : (
            <>
              <span className="mapsave-msg"><b>Your Winning Map is ready.</b> Approve it to load it into your dashboard.</span>
              <button className="mapsave-btn" disabled={status === "saving"} onClick={save}>
                {status === "saving" ? "Saving…" : "Save & load →"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
