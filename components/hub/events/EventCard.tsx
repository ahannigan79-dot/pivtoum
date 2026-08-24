import { EVENT_LABELS, formatWhen, type EventRow } from "@/lib/events";
import { RsvpButton } from "./RsvpButton";

export function EventCard({ e, past = false }: { e: EventRow; past?: boolean }) {
  return (
    <article className={"event" + (past ? " past" : "")}>
      <div className="event-main">
        <div className="event-head">
          <span className={"event-type t-" + e.type}>{EVENT_LABELS[e.type] ?? e.type}</span>
          <span className="event-when">{formatWhen(e.startsAt)}{e.durationMins ? ` · ${e.durationMins}m` : ""}</span>
        </div>
        <h3>{e.title}</h3>
        {e.description && <p className="event-desc">{e.description}</p>}
      </div>
      <div className="event-actions">
        {!past && <RsvpButton eventId={e.id} going={e.iGoing} count={e.goingCount} />}
        {!past && e.joinUrl && <a className="event-join" href={e.joinUrl} target="_blank" rel="noopener noreferrer">Join ↗</a>}
        {past && e.recordingUrl && <a className="event-join" href={e.recordingUrl} target="_blank" rel="noopener noreferrer">Recording ↗</a>}
      </div>
    </article>
  );
}
