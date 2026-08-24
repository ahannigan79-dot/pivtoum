"use client";
import { useTransition } from "react";
import { markWelcomeBooked } from "@/app/hub/actions";

/** Small confirm affordance for the Welcome-session step. */
export function MarkBooked() {
  const [pending, start] = useTransition();
  return (
    <button className="gmark" disabled={pending} onClick={() => start(() => markWelcomeBooked())}>
      {pending ? "…" : "I've booked it"}
    </button>
  );
}
