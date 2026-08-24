import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/member";

type Computed = {
  overall?: number; career?: string; lane?: string;
  urgency?: { level?: string }; move?: { stance?: string };
};

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];

  const { userId } = await auth();
  const latest = userId
    ? (await db.select().from(mapStates).where(eq(mapStates.memberId, userId)).orderBy(desc(mapStates.createdAt)).limit(1))[0]
    : null;
  const c = (latest?.computed ?? null) as Computed | null;
  const exposure = typeof latest?.overall === "number" ? Math.round(latest.overall) : null;
  const expClass = exposure == null ? "" : exposure >= 65 ? "warn" : exposure >= 45 ? "" : "ok";

  return (
    <>
      <div className="hub-top"><h1>Your Hub</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Welcome back, <b>{first}</b>. Everything you do here flows into one picture —
          your Map sets the scores, and Learn, Build and Evolve move them.
        </p>

        <div className="hub-sectlabel">The Winning Loop</div>
        <div className="hub-grid">
          {/* Map card — data-driven once a map is saved */}
          {c ? (
            <Link href="/hub/map" className="card">
              <p className="ck">🧭 Your Map · {c.career ?? ""}</p>
              <div className={`big ${expClass}`}>{exposure}</div>
              <p style={{ color: "var(--pencil)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                Overall exposure{c.lane ? ` · ${c.lane}` : ""}
              </p>
              <p>{c.move?.stance ? `Your move: ${c.move.stance}.` : "Open your Map to tune it."}</p>
            </Link>
          ) : (
            <Link href="/hub/map" className="card">
              <p className="ck">🧭 Map</p>
              <h3>Build your Winning Map</h3>
              <p>Answer a few questions and see exactly where you stand — your exposure, your levers, and your winning move.</p>
            </Link>
          )}
          <Link href="/hub/learn" className="card">
            <p className="ck">📚 Learn</p>
            <h3>The levers</h3>
            <p>Understand what decides who&apos;s exposed and who&apos;s protected in the age of AI.</p>
          </Link>
          <Link href="/hub/build" className="card">
            <p className="ck">🛠 Build</p>
            <h3>Do the work</h3>
            <p>Master the machine and train your judgment — the Gym, the Operator, your rebuilds.</p>
          </Link>
          <Link href="/hub/evolve" className="card">
            <p className="ck">📈 Evolve</p>
            <h3>Pull the levers</h3>
            <p>Implement the change, track your trajectory, and re-map as the world moves.</p>
          </Link>
        </div>

        <div className="hub-sectlabel">Your community</div>
        <div className="hub-grid">
          <Link href="/hub/pods" className="card">
            <p className="ck">👥 Pod</p>
            <h3>Your accountability pod</h3>
            <p>The people on the same path, holding you to what you commit to.</p>
          </Link>
          <Link href="/hub/events" className="card">
            <p className="ck">📅 Next up</p>
            <h3>Book your 1:1 welcome</h3>
            <p>A 60-minute session with Adam to walk your Map and set your first moves.</p>
          </Link>
          <Link href="/hub/community" className="card">
            <p className="ck">💬 Feed</p>
            <h3>The conversation</h3>
            <p>Wins, questions, and what everyone&apos;s working on this week.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
