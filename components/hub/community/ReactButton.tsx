"use client";
import { useTransition } from "react";
import { toggleReaction } from "@/app/hub/community/actions";

export function ReactButton({ postId, count, mine }: { postId: string; count: number; mine: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className={"react" + (mine ? " on" : "")} disabled={pending}
      onClick={() => start(() => toggleReaction(postId))}>
      👍 <span>{count}</span>
    </button>
  );
}
