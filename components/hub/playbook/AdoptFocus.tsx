"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adoptFocus } from "@/app/hub/focus-actions";

/**
 * "Make this my focus" — adopts the play as a tracked focus goal (with its steps
 * as a checklist on Evolve), then takes the member to the dashboard. `already`
 * and `atCap` are resolved server-side so the button reflects state.
 */
export function AdoptFocus({ slug, already, atCap }: { slug: string; already: boolean; atCap: boolean }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(already);
  const router = useRouter();

  if (done) return <p className="adopt-note">✓ This is one of your focus goals — track it on your <a href="/hub">dashboard</a>.</p>;
  if (atCap) return <p className="adopt-note">You&rsquo;re focused on two goals already — finish or drop one to add this. Focus wins.</p>;

  return (
    <button className="btn btn-primary adopt-btn" disabled={pending}
      onClick={() => start(async () => { await adoptFocus(slug); setDone(true); router.push("/hub"); router.refresh(); })}>
      {pending ? "Adding…" : "Make this my focus →"}
    </button>
  );
}
