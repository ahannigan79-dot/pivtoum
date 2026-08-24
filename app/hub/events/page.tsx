import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUpcomingEvents, getPastEvents } from "@/lib/events";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { EventCard } from "@/components/hub/events/EventCard";
import { NewEventForm } from "@/components/hub/events/NewEventForm";

export const metadata = { title: "Events — Pivotum" };

export default async function EventsPage() {
  const { userId } = await auth();
  const profile = await getOrCreateProfile();
  const [upcoming, past] = await Promise.all([getUpcomingEvents(userId), getPastEvents(userId)]);

  return (
    <>
      <div className="hub-top"><h1>Events</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <Link href="/hub/events/welcome" className="welcome-cta">
          <div>
            <p className="ck">★ Start here</p>
            <h3>Book your 1:1 welcome with Adam</h3>
            <p>A 60-minute session to walk your Map together and set your first moves — then you&apos;re in.</p>
          </div>
          <span className="welcome-arrow">→</span>
        </Link>

        {isFounder(profile) && <NewEventForm />}

        <div className="hub-sectlabel">Upcoming</div>
        {upcoming.length === 0
          ? <p className="feed-empty">No events scheduled yet.</p>
          : upcoming.map((e) => <EventCard key={e.id} e={e} />)}

        {past.length > 0 && (
          <>
            <div className="hub-sectlabel">Past · recordings</div>
            {past.map((e) => <EventCard key={e.id} e={e} past />)}
          </>
        )}
      </div>
    </>
  );
}
