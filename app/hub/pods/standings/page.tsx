import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getMyPods } from "@/lib/pods";
import { monthlyLeaderboard, seasonLeaderboard, seasonOf, monthLabel, type PodScore } from "@/lib/competition";

export const metadata = { title: "Pod standings — Pivotum" };

function Board({ rows, mySlug }: { rows: PodScore[]; mySlug: string | null }) {
  if (rows.length === 0) return <p className="feed-empty">No pods on the board yet — the race starts as pods show up and ship.</p>;
  return (
    <ol className="lead-board">
      {rows.map((p, i) => (
        <li key={p.slug} className={"lb-pod" + (p.slug === mySlug ? " mine" : "") + (i === 0 ? " lead" : "")}>
          <span className="lb-rank">{i === 0 ? "🏆" : i + 1}</span>
          <span className="lb-crest">{p.crest ?? "👥"}</span>
          <Link href={`/hub/pods/${p.slug}`} className="lb-name">{p.name}{p.slug === mySlug && <span className="lb-you">you</span>}</Link>
          <span className="lb-meta">{p.participation}% shown up · {p.moves} verified move{p.moves === 1 ? "" : "s"}</span>
          <span className="lb-score">{p.score}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function StandingsPage() {
  const { userId } = await auth();
  const now = new Date();
  const season = seasonOf(now);
  const [month, seasonBoard, mine] = await Promise.all([
    monthlyLeaderboard(now), seasonLeaderboard(now), getMyPods(userId),
  ]);
  const mySlug = mine[0]?.slug ?? null;
  const seasonLeader = seasonBoard[0] ?? null;

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/pods/browse" className="back">‹ Pods</Link><span className="tt">Pod standings</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">The Pod Competition</p>
          <h2>Win it together.</h2>
          <p>Pods compete on doing the work as a team — showing up, shipping moves, and training. Every month has a
            winner (and a prize); every six months, one pod takes the season. Scored per person, so a small tight pod
            can out-run a big quiet one.</p>
        </div>

        <section className="lb-season">
          <div className="lb-season-head">
            <span className="pb-aim-tag rec">Season · {season.label}</span>
            <h3 className="pb-aim-title">The race for the {season.label} title</h3>
            <p className="pb-aim-blurb">
              {seasonLeader
                ? <>Leading right now: <b>{seasonLeader.crest ?? "👥"} {seasonLeader.name}</b>. The pod on top when the season closes is announced as the winning pod.</>
                : <>The season is open — first pods to show up and ship take the early lead.</>}
            </p>
          </div>
          <Board rows={seasonBoard} mySlug={mySlug} />
        </section>

        <div className="hub-sectlabel">This month · {monthLabel(now.getUTCFullYear(), now.getUTCMonth())}</div>
        <p className="lb-note">The monthly leader takes the smaller monthly prize — a fresh race every month, so it&rsquo;s never too late to climb.</p>
        <Board rows={month} mySlug={mySlug} />

        <p className="lb-how">
          <b>How the score works.</b> Mostly showing up: the share of your pod checking in each week is the spine of it.
          Then the moves your pod ships — counted per person, and only once a domain leader has verified the work, so
          the leaderboard reflects real proof, not clicked-through steps. Do the work together and you climb.
        </p>
      </div>
    </>
  );
}
