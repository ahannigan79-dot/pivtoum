"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { handOverCaptain, removePodMember, nudgePod, setPodGoal } from "@/app/hub/pods/actions";

type RosterMember = {
  id: string; name: string; handle: string | null; leader: boolean;
  intro: string | null; trial: boolean; checkedIn: boolean;
};

/** Captain console interactivity: nudge the pod, set the goal, and manage the
 *  roster (hand over the captaincy, remove a member). All actions are
 *  captain/founder-gated server-side. */
export function PodManage({ slug, goal, checkinCount, size, roster }: {
  slug: string; goal: string | null; checkinCount: number; size: number; roster: RosterMember[];
}) {
  const [pending, start] = useTransition();
  const [goalText, setGoalText] = useState(goal ?? "");

  return (
    <>
      <section className="card cm-card">
        <div className="chead">
          <span className="eyebrow">This week</span>
          <span className="cm-count">{checkinCount}/{size} checked in</span>
        </div>
        <p className="cm-sub">Nudge anyone who hasn&rsquo;t dropped their check-in — each gets a reminder.</p>
        <button className="btn btn-ghost" disabled={pending} onClick={() => start(() => { void nudgePod(slug); })}>
          {pending ? "Nudging…" : "Nudge the pod →"}
        </button>
      </section>

      <section className="card cm-card">
        <div className="chead"><span className="eyebrow">Pod goal</span></div>
        <p className="cm-sub">One line the pod is rallying behind — shown at the top of your pod.</p>
        <form className="cm-goal" onSubmit={(e) => { e.preventDefault(); start(() => { void setPodGoal(slug, goalText); }); }}>
          <input className="cm-goal-input" value={goalText} maxLength={280}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. Everyone ships one AI-native rebuild this month." />
          <button className="btn btn-primary" type="submit" disabled={pending}>Save</button>
        </form>
      </section>

      <section className="card cm-card">
        <div className="chead"><span className="eyebrow">Roster · {roster.length}</span></div>
        <ul className="cm-roster">
          {roster.map((m) => (
            <li key={m.id} className="cm-member">
              <div className="cm-member-id">
                <Link href={`/hub/members/${m.handle ?? m.id}`} className="cm-member-name">{m.name}</Link>
                {m.leader && <span className="pod-lead-tag">Captain</span>}
                {m.trial && <span className="cm-trial">Trial</span>}
                <span className={`cm-checked ${m.checkedIn ? "on" : ""}`}>{m.checkedIn ? "✓ checked in" : "— waiting"}</span>
              </div>
              {m.intro && <p className="cm-member-intro">{m.intro}</p>}
              {!m.leader && (
                <div className="cm-member-acts">
                  <button className="cm-act" disabled={pending} onClick={() => start(() => { void handOverCaptain(slug, m.id); })}>Make captain</button>
                  <button className="cm-act danger" disabled={pending} onClick={() => start(() => { void removePodMember(slug, m.id); })}>Remove</button>
                </div>
              )}
            </li>
          ))}
          {roster.length === 0 && <li className="muted">No members yet.</li>}
        </ul>
      </section>
    </>
  );
}
