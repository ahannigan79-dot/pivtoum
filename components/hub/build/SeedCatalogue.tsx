"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Seed = { seeded: string[]; filled: number; remaining: number; total: number; done: boolean };

/**
 * Founder tool: pre-seed the Gym catalogue with 2 reps per career. Runs bounded
 * batches back-to-back (client-driven) so long generation never trips the
 * timeout, showing live progress. Idempotent — safe to run again anytime.
 */
export function SeedCatalogue({ endpoint = "/api/hub/gym-seed", noun = "rep" }: { endpoint?: string; noun?: string }) {
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setRunning(true);
    setMsg(`Seeding the catalogue — this generates ${noun}s, so it takes a few minutes. You can leave it running.`);
    try {
      // Loop batches until done (or a safety cap on iterations).
      for (let i = 0; i < 40; i++) {
        const res = await fetch(endpoint, { method: "POST" });
        if (!res.ok) { setMsg("Couldn't seed (are you signed in as founder?). Try again."); break; }
        const data = (await res.json()) as Seed;
        if (data.done) { setMsg("Catalogue seeded — every career now has its content. ✓"); router.refresh(); break; }
        setMsg(`Seeding… about ${data.remaining} career${data.remaining === 1 ? "" : "s"} to go.`);
      }
    } catch {
      setMsg("Seeding stopped early — run it again to finish (it picks up where it left off).");
    } finally {
      setRunning(false);
    }
  }

  async function clear() {
    if (!confirm(`Remove all pre-seeded ${noun}s from the catalogue? (Member-generated ones are kept.) You can re-seed after.`)) return;
    setRunning(true);
    setMsg("Clearing the seeded catalogue…");
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = (await res.json()) as { cleared?: number };
      setMsg(`Cleared ${data.cleared ?? 0} seeded ${noun}s. Run "Seed 2 per career" to rebuild them.`);
      router.refresh();
    } catch {
      setMsg("Couldn't clear — try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="gymseed">
      <div className="gymseed-copy">
        <p className="ck">Founder · warm the catalogue</p>
        <p>Pre-seed <b>2 {noun}s for every career</b> so the first member in any lane gets an instant one. Safe to run again — it only tops up what&rsquo;s missing.</p>
        {msg && <p className="gymseed-msg">{msg}</p>}
      </div>
      <div className="gymseed-actions">
        <button className="gymseed-btn" onClick={run} disabled={running} aria-busy={running}>
          {running ? "Working…" : "Seed 2 per career"}
        </button>
        <button className="gymseed-clear" onClick={clear} disabled={running}>Clear seeded</button>
      </div>
    </div>
  );
}
