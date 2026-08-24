"use client";
import { useState, useTransition } from "react";
import { addComment } from "@/app/hub/community/actions";

const EMOJI = ["👍", "🎉", "🔥", "🙌", "❤️", "🤔"];

export function CommentBox({ postId }: { postId: string }) {
  const [val, setVal] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="cbox"
      onSubmit={(e) => {
        e.preventDefault();
        const b = val.trim();
        if (!b) return;
        start(async () => { await addComment(postId, b); setVal(""); });
      }}
    >
      <input value={val} onChange={(e) => setVal(e.target.value)} maxLength={3000} placeholder="Write a comment…" />
      <div className="cbox-emoji">
        {EMOJI.map((em) => <button key={em} type="button" onClick={() => setVal((v) => v + em)}>{em}</button>)}
      </div>
      <button type="submit" disabled={pending || !val.trim()}>Send</button>
    </form>
  );
}
