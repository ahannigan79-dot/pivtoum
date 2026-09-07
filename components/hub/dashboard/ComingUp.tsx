import Link from "next/link";
import { formatWhen, formatTime } from "@/lib/events";
import type { ComingUp as Data } from "@/lib/coming-up";
import type { MyStanding } from "@/lib/competition";

const ord = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

/** "Coming up" — the time-bound things worth keeping in view: your next re-score,
 *  your next event, your pod's week (check-in + streak), and your pod's standing. */
export function ComingUp({ data, rescoreDays, rescoreDue, standing }: {
  data: Data; rescoreDays: number | null; rescoreDue: boolean; standing?: MyStanding | null;
}) {
  const { nextEvent, pod } = data;
  if (!nextEvent && !pod && rescoreDays == null && !standing) return null;

  return (
    <section className="card cu-card">
      <p className="ck">Coming up</p>
      <div className="cu-list">
        {rescoreDays != null && (
          <Link href="/hub/map" className="cu-row">
            <span className="cu-ic">🧭</span>
            <span className="cu-body">
              <b>{rescoreDue ? "Re-score due now" : `Re-score in ${rescoreDays} day${rescoreDays === 1 ? "" : "s"}`}</b>
              <i>{rescoreDue ? "Refresh your read — the field has moved" : "Keep your read true — every 2 months"}</i>
            </span>
            {rescoreDue && <span className="cu-flag">Due</span>}
          </Link>
        )}
        {nextEvent && (
          <Link href="/hub/events" className="cu-row">
            <span className="cu-ic">📅</span>
            <span className="cu-body">
              <b>{nextEvent.title}</b>
              <i>{formatWhen(nextEvent.startsAt)} · {formatTime(nextEvent.startsAt)}</i>
            </span>
            {nextEvent.joinUrl && <a href={nextEvent.joinUrl} target="_blank" rel="noopener noreferrer" className="cu-join">Join</a>}
          </Link>
        )}
        {pod && (
          <Link href={`/hub/pods/${pod.slug}`} className="cu-row">
            <span className="cu-ic">{pod.crest ?? "👥"}</span>
            <span className="cu-body">
              <b>{pod.checkedIn ? "Checked in this week ✓" : "Check in with your pod"}</b>
              <i>{pod.name}{pod.streakWeeks > 0 ? ` · 🔥 ${pod.streakWeeks}-week streak` : ""}</i>
            </span>
            {!pod.checkedIn && <span className="cu-flag warn">Due</span>}
          </Link>
        )}
        {standing && (
          <Link href="/hub/pods/standings" className="cu-row">
            <span className="cu-ic">🏆</span>
            <span className="cu-body">
              <b>Your pod is {ord(standing.monthRank)} this month</b>
              <i>{standing.total} pod{standing.total === 1 ? "" : "s"} in the race · see the standings</i>
            </span>
            {standing.monthRank === 1 && <span className="cu-flag">Leading</span>}
          </Link>
        )}
      </div>
    </section>
  );
}
