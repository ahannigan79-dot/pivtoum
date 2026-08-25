"use client";
import { useFormStatus } from "react-dom";
import { generateRebuild } from "@/app/hub/build/rebuild/actions";

function Submit({ lane }: { lane: string | null }) {
  const { pending } = useFormStatus();
  return (
    <button className="gym-gen-btn" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Rebuilding…" : lane ? `Rebuild a workflow for ${lane} ✦` : "Rebuild a workflow ✦"}
    </button>
  );
}

/**
 * Infinite Workflow Rebuilds: generate a fresh, on-target rebuild for the
 * member's exact lane — and, optionally, a specific workflow they name — so the
 * environment isn't limited to the hand-authored library's few careers.
 */
export function GenerateRebuild({ lane, career, notice }: { lane: string | null; career: string | null; notice?: string | null }) {
  return (
    <div className="gym-gen">
      <div className="gym-gen-copy">
        <p className="ck">✦ Your lane, your workflow</p>
        <h3>{lane ? `Rebuild a workflow for ${lane}` : "Rebuild a workflow for your lane"}</h3>
        <p>
          {lane
            ? "See any workflow from your day rebuilt AI-native — where the machine takes over, and where your value climbs. Name a workflow, or let us pick a core one."
            : "Map your lane first for a rebuild tuned to your exact work — or generate a general one now to see how it plays."}
        </p>
        {notice === "failed" && <p className="gym-gen-err">That one didn&apos;t come through — give it another go.</p>}
        {notice === "nolane" && <p className="gym-gen-err">Build your Map first so we can tune the rebuild to your lane.</p>}
      </div>
      <form action={generateRebuild} className="gym-gen-form">
        {lane && <input type="hidden" name="lane" value={lane} />}
        {career && <input type="hidden" name="career" value={career} />}
        <input className="gym-gen-input" name="workflow" maxLength={80} placeholder="A workflow to rebuild (optional) — e.g. onboarding a new client" />
        <Submit lane={lane} />
      </form>
    </div>
  );
}
