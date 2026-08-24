"use client";
import { useEffect } from "react";

/** Embeds the Winning Map tool and saves each completed map to the member's record. */
export function MapFrame() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || d.type !== "pivotum:map") return;
      fetch("/api/hub/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: d.answers, computed: d.computed, overall: d.overall }),
      }).catch(() => {});
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      src="/tools/winning-map.html"
      title="Your Winning Map"
      style={{ width: "100%", height: "100dvh", border: 0, display: "block", background: "#141209" }}
    />
  );
}
