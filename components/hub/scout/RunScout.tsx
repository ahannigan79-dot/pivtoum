"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runScoutNow } from "@/app/hub/scout/actions";

export function RunScout({ hasReport }: { hasReport: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [err, setErr] = useState(false);

  function run() {
    setErr(false);
    start(async () => {
      const r = await runScoutNow();
      if (!r.ok) { setErr(true); return; }
      router.refresh();
    });
  }

  return (
    <div className="scout-run">
      <button className="scout-run-btn" onClick={run} disabled={pending} aria-busy={pending}>
        {pending ? "Scouting the web…" : hasReport ? "🛰 Run scout again" : "🛰 Run the scout"}
      </button>
      {pending && <span className="scout-run-hint">Searching and curating — this takes a minute.</span>}
      {err && <span className="scout-run-err">Couldn&apos;t complete a scout just now. Try again in a moment.</span>}
    </div>
  );
}
