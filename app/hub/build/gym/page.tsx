import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { gymByLane } from "@/lib/gym";
import { getBuildReps } from "@/lib/build";
import { aiConfigured } from "@/lib/ai";
import { memberLane } from "@/lib/gym-generate";
import { GenerateRep } from "@/components/hub/build/GenerateRep";

export const metadata = { title: "Judgment Gym — Pivotum" };

export default async function GymLanding({ searchParams }: { searchParams: Promise<{ gen?: string }> }) {
  const { userId } = await auth();
  const [done, seed, { gen }] = await Promise.all([
    getBuildReps(userId),
    aiConfigured() ? memberLane(userId) : Promise.resolve(null),
    searchParams,
  ]);
  const lanes = gymByLane();

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Judgment Gym</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">🥊 The Judgment Gym</p>
          <h2>The AI hands you polished work. Some of it is wrong.</h2>
          <p>Pick a rep. Judge each piece <b>Ship</b> or <b>Flag</b> at speed, then get scored on what you caught and what you shipped. This is Edge 2 — the judgment the machine can&apos;t hold. Fresh reps rotate in each lane; come back weekly.</p>
        </div>

        {aiConfigured() && (
          <GenerateRep lane={seed?.lane ?? null} career={seed?.career ?? null} notice={gen ?? null} />
        )}

        {lanes.map(({ lane, reps }) => {
          const doneCount = reps.filter((r) => done.has(`gym:${r.slug}`)).length;
          return (
            <div key={lane} className="gym-lane">
              <div className="gym-lane-head">
                <div className="hub-sectlabel">{lane}</div>
                <span className="gym-lane-count">{doneCount}/{reps.length} reps done</span>
              </div>
              <div className="hub-grid">
                {reps.map((s, i) => (
                  <Link key={s.slug} href={`/hub/build/gym/${s.slug}`} className="card gym-card">
                    <p className="ck">🥊 Rep {i + 1}{done.has(`gym:${s.slug}`) ? " · done ✓" : ""}</p>
                    <h3>{s.client}</h3>
                    <p>{s.short}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
