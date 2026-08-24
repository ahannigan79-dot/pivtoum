"use client";
import { useState, useTransition } from "react";
import { logBuildRep } from "@/app/hub/actions";

/** "Log this rep" affordance for a Build tool — self-attested completion. */
export function LogRep({ repKey, done = false }: { repKey: string; done?: boolean }) {
  const [logged, setLogged] = useState(done);
  const [pending, start] = useTransition();
  if (logged) return <span className="rep-done">✓ Rep logged</span>;
  return (
    <button className="rep-log" disabled={pending}
      onClick={() => start(async () => { await logBuildRep(repKey); setLogged(true); })}>
      {pending ? "…" : "Log this rep"}
    </button>
  );
}
