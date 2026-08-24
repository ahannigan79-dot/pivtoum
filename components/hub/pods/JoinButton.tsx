"use client";
import { useTransition } from "react";
import { joinPod, leavePod } from "@/app/hub/pods/actions";

export function JoinButton({ slug, joined, size = "md" }: { slug: string; joined: boolean; size?: "md" | "sm" }) {
  const [pending, start] = useTransition();
  const cls = "pod-join" + (joined ? " on" : "") + (size === "sm" ? " sm" : "");
  return (
    <button
      className={cls}
      disabled={pending}
      onClick={() => start(() => (joined ? leavePod(slug) : joinPod(slug)))}
    >
      {pending ? "…" : joined ? "✓ Joined" : "Join pod"}
    </button>
  );
}
