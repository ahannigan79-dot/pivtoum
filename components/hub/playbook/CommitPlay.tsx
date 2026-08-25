"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptSuggestion } from "@/app/hub/actions";

/**
 * Commit a play as a live move: seeds the play's concrete first move into the
 * member's Evolve moves (same path as accepting a Map suggestion), then takes
 * them to the dashboard where the move is now in flight.
 */
export function CommitPlay({ title, lever }: { title: string; lever: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  function commit() {
    start(async () => {
      await acceptSuggestion(title, lever);
      setDone(true);
      router.push("/hub");
      router.refresh();
    });
  }

  return (
    <div className="play-commit">
      <button className="play-commit-btn" onClick={commit} disabled={pending || done}>
        {done ? "Added to your moves ✓" : pending ? "Adding…" : "Commit this as my move →"}
      </button>
      <p className="play-commit-first"><span>Your first move:</span> {title}</p>
    </div>
  );
}
