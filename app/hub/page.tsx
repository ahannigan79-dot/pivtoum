import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getTrajectory, exposureBand, bandWord } from "@/lib/trajectory";
import { Trend } from "@/components/hub/dashboard/Trend";

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();

const EDGE2: Record<string, { label: string; blurb: string }> = {
  guard: { label: "Guard your moat", blurb: "watch the protection that's holding, and defend it" },
  shift: { label: "Shift lanes", blurb: "steer toward the drier lanes inside your field" },
  relocate: { label: "Plan your relocate", blurb: "scout more protected ground while you have runway" },
};

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const t = await getTrajectory(userId);
  const c = t.computed;

  const band = exposureBand(t.overall);
  const laneBandWord = bandWord(c?.band);
  const urgency = c?.urgency?.level ?? null;
  const move = c?.move ?? null;
  const e2 = move?.edge2 ? EDGE2[move.edge2] : null;
  const renovateW = move?.weight != null ? 100 - move.weight : 60;
  const edge2W = move?.weight ?? 40;

  // trajectory delta (exposure down = progress)
  const delta = t.history.length >= 2 ? t.history[t.history.length - 1].overall - t.history[0].overall : null;

  return (
    <>
      <div className="hub-top"><h1>Your Hub</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Welcome back, <b>{first}</b>.{" "}
          {t.hasMap
            ? "Here's where you stand and the one move that matters most right now."
            : "Everything here flows into one picture — your Map sets the scores, and Learn, Build and Evolve move them."}
        </p>

        {t.hasMap ? (
          <>
            {/* ---- Trajectory cockpit ---- */}
            <div className="cockpit">
              {/* Where you stand */}
              <section className="ck-card ck-stand">
                <p className="ck">Where you stand{c?.career ? ` · ${c.career}` : ""}</p>
                <div className="stand-row">
                  <div className="stand-num">
                    <div className={`big ${band.cls}`}>{t.overall}</div>
                    <span className="stand-unit">exposure{band.word ? ` · ${band.word}` : ""}</span>
                  </div>
                  <div className="stand-trend">
                    <Trend points={t.history} />
                    <span className="trend-note">
                      {t.history.length < 2
                        ? "Your first reading — the line builds at each re-score."
                        : delta != null && delta < 0
                          ? `↓ ${Math.abs(delta)} since you started. That's the direction.`
                          : delta != null && delta > 0
                            ? `↑ ${delta} — the world moved. Time to pull levers.`
                            : "Holding steady across re-scores."}
                    </span>
                  </div>
                </div>
                <div className="stand-foot">
                  {c?.lane && <span className="tag">{c.lane}{laneBandWord ? ` · ${laneBandWord} risk` : ""}</span>}
                  {urgency && <span className={`tag urg u-${urgency.toLowerCase()}`}>Urgency: {urgency}</span>}
                  <Link href="/hub/map" className="cardlink">Open your Map →</Link>
                </div>
              </section>

              {/* Your winning move */}
              <section className="ck-card ck-move">
                <p className="ck">Your winning move</p>
                <h3 className="move-stance">{move?.stance ?? "Open your Map to set your move"}</h3>
                <div className="mixbar" aria-hidden="true">
                  <span className="mix-reno" style={{ width: `${renovateW}%` }} />
                  <span className="mix-e2" style={{ width: `${edge2W}%` }} />
                </div>
                <div className="mix-legend">
                  <span><i className="d d-reno" /> ◆ Master the machine · {renovateW}%</span>
                  {e2 && <span><i className="d d-e2" /> ✦ {e2.label} · {edge2W}%</span>}
                </div>
                {move?.e2short && <p className="move-blurb">{strip(move.e2short)}</p>}
                <div className="stand-foot">
                  <Link href="/hub/build" className="cardlink">Go to Build →</Link>
                </div>
              </section>

              {/* What's driving this */}
              {c?.driver && (
                <section className="ck-card ck-driver">
                  <p className="ck">What&apos;s driving this</p>
                  {c.driver.why && <p className="drv-why">{strip(c.driver.why)}</p>}
                  {c.driver.down && (
                    <p className="drv-line"><span className="drv-k">Deepen</span> {strip(c.driver.down)}</p>
                  )}
                  {c.driver.action && (
                    <p className="drv-action">{strip(c.driver.action)}</p>
                  )}
                </section>
              )}

              {/* Progress ledger */}
              <section className="ck-card ck-ledger">
                <p className="ck">Your progress</p>
                <div className="ledger">
                  <div className="led"><span className="led-n">{t.movesDone}</span><span className="led-l">moves shipped</span></div>
                  <div className="led"><span className="led-n">{t.movesActive}</span><span className="led-l">in flight</span></div>
                  <div className="led"><span className="led-n">{t.badgeCount}</span><span className="led-l">credentials</span></div>
                  <div className="led"><span className="led-n">{t.editions}</span><span className="led-l">re-scores</span></div>
                </div>
                <Link href="/hub/evolve" className="cardlink">Pull the levers →</Link>
              </section>
            </div>
          </>
        ) : (
          <Link href="/hub/map" className="cta-hero">
            <div>
              <p className="ck">★ Start here</p>
              <h3>Build your Winning Map</h3>
              <p>Answer a few questions and see exactly where you stand — your exposure, what&apos;s driving it, and your one winning move.</p>
            </div>
            <span className="welcome-arrow">→</span>
          </Link>
        )}

        <div className="hub-sectlabel">The Winning Loop</div>
        <div className="hub-grid">
          <Link href="/hub/map" className="card">
            <p className="ck">🧭 Map</p>
            <h3>{t.hasMap ? "Re-tune your Map" : "Your Map"}</h3>
            <p>Where you stand — exposure, levers, and your winning move.</p>
          </Link>
          <Link href="/hub/learn" className="card">
            <p className="ck">📚 Learn</p>
            <h3>The levers</h3>
            <p>What decides who&apos;s exposed and who&apos;s protected in the age of AI.</p>
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
