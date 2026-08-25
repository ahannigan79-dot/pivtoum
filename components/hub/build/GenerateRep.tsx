"use client";
import { useFormStatus } from "react-dom";
import { generateGymRep } from "@/app/hub/build/gym/actions";

function Submit({ lane }: { lane: string | null }) {
  const { pending } = useFormStatus();
  return (
    <button className="gym-gen-btn" type="submit" disabled={pending} aria-busy={pending}>
      {pending
        ? "Writing your rep…"
        : lane
          ? `Generate a fresh rep for ${lane} ✦`
          : "Generate a fresh rep ✦"}
    </button>
  );
}

/**
 * Founder-free, self-serve infinite reps: a fresh Judgment Gym scenario written
 * on demand for the member's exact lane. Seeded from their Map; falls back to a
 * generic rep if they haven't mapped a lane yet.
 */
export function GenerateRep({ lane, career, notice }: { lane: string | null; career: string | null; notice?: string | null }) {
  return (
    <div className="gym-gen">
      <div className="gym-gen-copy">
        <p className="ck">✦ Never run out of reps</p>
        <h3>{lane ? `A fresh rep, built for ${lane}` : "A fresh rep, built for your lane"}</h3>
        <p>
          {lane
            ? "Judgment is a muscle — the more varied the reps, the sharper the edge. Generate a brand-new scenario for your exact lane, on demand."
            : "Map your lane first for reps tuned to your exact work — or generate a general one now to see how it plays."}
        </p>
        {notice === "failed" && <p className="gym-gen-err">That one didn&apos;t come through — give it another go.</p>}
        {notice === "nolane" && <p className="gym-gen-err">Build your Map first so we can tune the rep to your lane.</p>}
      </div>
      <form action={generateGymRep}>
        {lane && <input type="hidden" name="lane" value={lane} />}
        {career && <input type="hidden" name="career" value={career} />}
        <Submit lane={lane} />
      </form>
    </div>
  );
}
