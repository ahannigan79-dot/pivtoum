import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MarkStarted } from "@/components/hub/MarkStarted";
import { CURRICULUM, getLearnProgress, learnTotals } from "@/lib/learn";

export const metadata = { title: "Learn — Winning in the Age of AI" };

export default async function LearnPage() {
  const { userId } = await auth();
  const done = await getLearnProgress(userId);
  const totals = learnTotals(done);

  return (
    <>
      <MarkStarted />
      <div className="hub-top"><h1>Learn</h1><span className="sp" /></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">The rules of the game</p>
          <h2>Your score isn&apos;t luck — it&apos;s a system you can play.</h2>
          <p>Ten short lessons on the ideas behind your Map: the stance that wins, the six levers that set your exposure, and the plays that lower it. Read them in a sitting — and every one you finish counts as effort that buys down your score.</p>
        </div>

        <div className="learn-prog">
          <div className="learn-prog-top">
            <span className="learn-prog-lbl">{totals.complete} of {totals.total} lessons</span>
            <span className="learn-prog-pct">{totals.pct}%</span>
          </div>
          <div className="learn-prog-bar"><span style={{ width: `${totals.pct}%` }} /></div>
        </div>

        {CURRICULUM.map((m) => {
          const mDone = m.lessons.filter((l) => done.has(l.key)).length;
          return (
            <div key={m.slug} className="learn-mod">
              <div className="learn-mod-head">
                <div>
                  <div className="hub-sectlabel">{m.title}</div>
                  <p className="learn-mod-blurb">{m.blurb}</p>
                </div>
                <span className="learn-mod-count">{mDone}/{m.lessons.length}</span>
              </div>
              <div className="learn-lessons">
                {m.lessons.map((l) => {
                  const isDone = done.has(l.key);
                  return (
                    <Link key={l.key} href={`/hub/learn/${l.key}`} className={"learn-lesson" + (isDone ? " done" : "")}>
                      <span className="learn-check">{isDone ? "✓" : "○"}</span>
                      <span className="learn-lesson-main">
                        <b>{l.title}</b>
                        <span className="learn-lesson-sum">{l.summary}</span>
                      </span>
                      <span className="learn-mins">{l.minutes}m</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="hub-sectlabel">Put it to work</div>
        <div className="build-grid">
          <Link href="/hub/map" className="build-tile a-green"><span className="bt-ic">🧭</span><div className="bt-body"><span className="bt-kicker">Your Map</span><h3>See your own levers</h3><p>Your Map scores each of these for your exact lane — and names the one to pull first.</p><span className="bt-cta">Open your Map →</span></div></Link>
          <Link href="/hub/build" className="build-tile a-green"><span className="bt-ic">🛠</span><div className="bt-body"><span className="bt-kicker">Build</span><h3>Train the two edges</h3><p>Master the machine on the exposing levers; deepen what AI can&apos;t take on the protecting ones.</p><span className="bt-cta">Go to Build →</span></div></Link>
        </div>
      </div>
    </>
  );
}
