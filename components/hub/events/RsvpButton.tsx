"use client";
import { useTransition } from "react";
import { toggleRsvp } from "@/app/hub/events/actions";

export function RsvpButton({ eventId, going, count }: { eventId: string; going: boolean; count: number }) {
  const [pending, start] = useTransition();
  return (
    <button className={"rsvp" + (going ? " on" : "")} disabled={pending} onClick={() => start(() => toggleRsvp(eventId))}>
      {going ? "✓ Going" : "RSVP"}
      {count > 0 && <span className="rsvp-count"> · {count}</span>}
    </button>
  );
}
