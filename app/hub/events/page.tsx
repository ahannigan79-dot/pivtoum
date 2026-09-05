import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUpcomingEvents, getPastEvents, getEventsInMonth } from "@/lib/events";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getMyLedPods } from "@/lib/pods";
import { EventCard } from "@/components/hub/events/EventCard";
import { EventCalendar } from "@/components/hub/events/EventCalendar";
import { NewEventForm } from "@/components/hub/events/NewEventForm";
import { HostSessionForm } from "@/components/hub/events/HostSessionForm";

export const metadata = { title: "Events — Pivotum" };

function parseMonth(m: string | undefined): { year: number; month0: number } {
  const now = new Date();
  const match = m && /^(\d{4})-(\d{1,2})$/.exec(m);
  if (match) {
    const year = Number(match[1]);
    const month0 = Math.min(11, Math.max(0, Number(match[2]) - 1));
    return { year, month0 };
  }
  return { year: now.getFullYear(), month0: now.getMonth() };
}

const mKey = (y: number, m0: number) => `${y}-${m0 + 1}`;

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { userId } = await auth();
  const profile = await getOrCreateProfile();
  const founder = isFounder(profile);
  const { m } = await searchParams;
  const { year, month0 } = parseMonth(m);

  const [monthEvents, upcoming, past, ledPods] = await Promise.all([
    getEventsInMonth(userId, year, month0),
    getUpcomingEvents(userId),
    getPastEvents(userId),
    getMyLedPods(userId),
  ]);

  const prev = month0 === 0 ? { y: year - 1, m: 11 } : { y: year, m: month0 - 1 };
  const next = month0 === 11 ? { y: year + 1, m: 0 } : { y: year, m: month0 + 1 };
  const now = new Date();

  return (
    <>
      <div className="hub-top"><h1>Events</h1><span className="sp" /></div>
      <div className="hub-body events-body">
        <Link href="/hub/events/welcome" className="welcome-cta">
          <div>
            <p className="ck">★ Start here</p>
            <h3>Book your 1:1 welcome with Adam</h3>
            <p>A 60-minute session to walk your Map together and set your first moves — then you&apos;re in.</p>
          </div>
          <span className="welcome-arrow">→</span>
        </Link>

        {founder && <NewEventForm />}
        {!founder && ledPods.length > 0 && <HostSessionForm pods={ledPods} />}
        {!founder && ledPods.length === 0 && (
          <Link href="/hub/contribute" className="newevent-toggle">+ Propose a session to host</Link>
        )}

        <EventCalendar
          year={year} month0={month0} events={monthEvents}
          prevHref={`/hub/events?m=${mKey(prev.y, prev.m)}`}
          nextHref={`/hub/events?m=${mKey(next.y, next.m)}`}
          todayHref={`/hub/events?m=${mKey(now.getFullYear(), now.getMonth())}`}
        />

        <div className="hub-sectlabel">Upcoming</div>
        {upcoming.length === 0
          ? <p className="feed-empty">No events scheduled yet.</p>
          : upcoming.map((e) => <EventCard key={e.id} e={e} admin={founder} />)}

        {past.length > 0 && (
          <>
            <div className="hub-sectlabel">Past · recordings</div>
            {past.map((e) => <EventCard key={e.id} e={e} past admin={founder} />)}
          </>
        )}
      </div>
    </>
  );
}
