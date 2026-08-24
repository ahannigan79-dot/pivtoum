import Link from "next/link";
import { monthMatrix, dayKey, formatTime, MONTH_NAMES, EVENT_LABELS, type EventRow } from "@/lib/events";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventCalendar({
  year, month0, events, prevHref, nextHref, todayHref,
}: {
  year: number; month0: number; events: EventRow[];
  prevHref: string; nextHref: string; todayHref: string;
}) {
  const cells = monthMatrix(year, month0);
  const byDay = new Map<string, EventRow[]>();
  for (const e of events) {
    const d = new Date(e.startsAt);
    const k = dayKey(d);
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(e);
  }

  return (
    <section className="cal">
      <div className="cal-top">
        <h2>{MONTH_NAMES[month0]} {year}</h2>
        <div className="cal-nav">
          <Link href={todayHref} className="cal-today">Today</Link>
          <Link href={prevHref} className="cal-arrow" aria-label="Previous month">‹</Link>
          <Link href={nextHref} className="cal-arrow" aria-label="Next month">›</Link>
        </div>
      </div>
      <div className="cal-grid cal-dow">
        {DOW.map((d) => <div key={d} className="cal-dowcell">{d}</div>)}
      </div>
      <div className="cal-grid cal-days">
        {cells.map((c) => {
          const evs = byDay.get(dayKey(c.date)) ?? [];
          return (
            <div key={c.date.toISOString()} className={"cal-cell" + (c.inMonth ? "" : " out") + (c.isToday ? " today" : "")}>
              <span className="cal-daynum">{c.day}</span>
              <div className="cal-events">
                {evs.map((e) => (
                  <a key={e.id} href={`#event-${e.id}`} className={"cal-pill t-" + e.type} title={`${EVENT_LABELS[e.type] ?? e.type} · ${e.title}`}>
                    <span className="cal-pill-time">{formatTime(e.startsAt)}</span> {e.title}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
