import Link from "next/link";
import { formatWhen, formatTime } from "@/lib/events";
import type { ComingUp as Data } from "@/lib/coming-up";

/** "Coming up" — the time-bound things worth keeping in view: your next re-score,
 *  your next event, and your pod's week (check-in + streak). */
export function ComingUp({ data, rescoreDays, rescoreDue }: {
  data: Data; rescoreDays: number | null; rescoreDue: boolean;
}) {
  const { nextEvent, pod } = data;
  if (!nextEvent && !pod && rescoreDays == null) return null;

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
      </div>
    </section>
  );
}
