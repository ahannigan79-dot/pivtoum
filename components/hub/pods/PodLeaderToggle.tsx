"use client";
import { useTransition } from "react";
import { setPodLeaderAction } from "@/app/hub/pods/actions";

/** Founder-only control to appoint or remove a pod leader. */
export function PodLeaderToggle({ slug, memberId, leader }: { slug: string; memberId: string; leader: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="pod-lead-btn"
      disabled={pending}
      onClick={() => start(() => { void setPodLeaderAction(slug, memberId, !leader); })}
    >
      {pending ? "…" : leader ? "Remove leader" : "Make leader"}
    </button>
  );
}
