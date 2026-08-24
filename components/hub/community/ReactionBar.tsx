"use client";
import { useState, useTransition } from "react";
import { toggleReaction } from "@/app/hub/community/actions";

const PICKER = ["👍", "❤️", "🔥", "🎉", "💡", "👏"];

export function ReactionBar({ postId, reactions }: {
  postId: string; reactions: { emoji: string; count: number; mine: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const react = (emoji: string) => { setOpen(false); start(() => toggleReaction(postId, emoji)); };

  return (
    <div className="reactbar">
      {reactions.map((r) => (
        <button key={r.emoji} className={"react" + (r.mine ? " on" : "")} disabled={pending}
          onClick={() => react(r.emoji)}>
          {r.emoji} <span>{r.count}</span>
        </button>
      ))}
      <div className="react-add">
        <button className="react react-plus" aria-label="Add reaction" onClick={() => setOpen((v) => !v)}>＋</button>
        {open && (
          <div className="react-pop">
            {PICKER.map((e) => <button key={e} onClick={() => react(e)}>{e}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}
