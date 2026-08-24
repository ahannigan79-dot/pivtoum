"use client";
import { useState, useTransition } from "react";
import { setPodGoal } from "@/app/hub/pods/actions";

export function PodGoal({ slug, goal, canEdit }: { slug: string; goal: string | null; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal ?? "");
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <div className="pod-goal editing">
        <span className="pod-goal-k">📌 Pod goal</span>
        <input value={val} onChange={(e) => setVal(e.target.value)} maxLength={280}
          placeholder="e.g. This month: everyone ships one AI-native rebuild" autoFocus />
        <button disabled={pending} onClick={() => start(async () => { await setPodGoal(slug, val); setEditing(false); })}>Save</button>
        <button className="ghost" onClick={() => { setVal(goal ?? ""); setEditing(false); }}>✕</button>
      </div>
    );
  }

  if (!goal) {
    if (!canEdit) return null;
    return <button className="pod-goal-set" onClick={() => setEditing(true)}>📌 Set a pod goal</button>;
  }

  return (
    <div className="pod-goal">
      <span className="pod-goal-k">📌 Pod goal</span>
      <span className="pod-goal-text">{goal}</span>
      {canEdit && <button className="pod-goal-edit" onClick={() => setEditing(true)}>Edit</button>}
    </div>
  );
}
