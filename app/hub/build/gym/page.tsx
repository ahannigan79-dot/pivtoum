import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { GYM_LIST } from "@/lib/gym";
import { getBuildReps } from "@/lib/build";

export const metadata = { title: "Judgment Gym — Pivotum" };

export default async function GymLanding() {
  const { userId } = await auth();
  const done = await getBuildReps(userId);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Judgment Gym</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">🥊 The Judgment Gym</p>
          <h2>The AI hands you polished work. Some of it is wrong.</h2>
          <p>Pick a rep. Judge each piece <b>Ship</b> or <b>Flag</b> at speed, then get scored on what you caught and what you shipped. This is Edge 2 — the judgment the machine can&apos;t hold — and every rep counts toward your trajectory.</p>
        </div>

        <div className="hub-grid">
          {GYM_LIST.map((s) => (
            <Link key={s.slug} href={`/hub/build/gym/${s.slug}`} className="card gym-card">
              <p className="ck">🥊 Rep{done.has(`gym:${s.slug}`) ? " · done ✓" : ""}</p>
              <h3>{s.career}</h3>
              <p>{s.short}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
