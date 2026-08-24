"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Payload = { answers: unknown; computed: unknown; overall: number | null };
type Status = "idle" | "saving" | "saved" | "error";

/** Embeds the Winning Map. When the map produces a result, a bar invites the
 *  member to approve & save it — then loads their dashboard. */
export function MapFrame() {
  const router = useRouter();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

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
      <iframe src="/tools/winning-map.html" title="Your Winning Map" className="mapframe" />

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
