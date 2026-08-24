"use client";
import { useTransition } from "react";
import { togglePin } from "@/app/hub/community/actions";

export function PinButton({ postId, pinned }: { postId: string; pinned: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      className={"pin-btn" + (pinned ? " on" : "")}
      disabled={pending}
      title={pinned ? "Unpin" : "Pin to top"}
      onClick={() => start(() => togglePin(postId))}
    >
      {pinned ? "📌 Pinned" : "Pin"}
    </button>
  );
}
