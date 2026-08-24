import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan, type PlanStep } from "@/lib/plan";
import { exposureBand, bandWord } from "@/lib/trajectory";
import { Trend } from "@/components/hub/dashboard/Trend";
import { NextAction } from "@/components/hub/dashboard/NextAction";
import { Checklist } from "@/components/hub/dashboard/Checklist";

export const metadata = { title: "Evolve — Pivotum" };

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();

const EDGE2: Record<string, { label: string }> = {
  guard: { label: "Guard your moat" },
  shift: { label: "Shift lanes" },
  relocate: { label: "Plan your relocate" },
};

/* When fully activated, the hero shifts to continuous improvement. */
function continuousNext(movesActive: number, movesDone: number): PlanStep {
  if (movesActive === 0) {
    return { key: "commit", label: "Set your next move", href: "/hub/map", cta: "Pick a lever",
      blurb: "You've got no move in flight. Turn your winning move into one concrete commitment this week.", done: false };
  }
  return { key: "ship", label: "Ship what you've committed to", href: "/hub/pods", cta: "Report progress",
    blurb: `You've shipped ${movesDone} and have ${movesActive} in flight. Keep the trajectory bending — report progress to your pod.`, done: false };
}

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const plan = await getPlan(userId);
  const t = plan?.traj ?? null;
  const c = t?.computed ?? null;

  const band = exposureBand(t?.overall ?? null);
  const laneBandWord = bandWord(c?.band);
  const urgency = c?.urgency?.level ?? null;
  const move = c?.move ?? null;
  const e2 = move?.edge2 ? EDGE2[move.edge2] : null;
  const renovateW = move?.weight != null ? 100 - move.weight : 60;
  const edge2W = move?.weight ?? 40;
  const delta = t && t.history.length >= 2 ? t.history[t.history.length - 1].overall - t.history[0].overall : null;

  const heroStep = plan ? (plan.next ?? continuousNext(t?.movesActive ?? 0, t?.movesDone ?? 0)) : null;
  const heroNum = plan ? Math.min(plan.activatedCount + 1, plan.activationTotal) : 0;

  return (
    <>
      <div className="hub-top"><h1>Evolve</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Welcome back, <b>{first}</b>. This is where it all comes together — your plan, your progress,
          and the next move that wins. {plan?.fullyActivated ? "Keep pulling the levers." : "Evolve to win."}
        </p>

        {heroStep && <NextAction step={heroStep} stepNum={heroNum} total={plan!.activationTotal} />}

        {plan && !plan.fullyActivated && (
          <Checklist steps={plan.steps} done={plan.activatedCount} total={plan.activationTotal} />
        )}

        {t?.hasMap && (
          <>
            <div className="hub-sectlabel">Your trajectory</div>
            <div className="cockpit">
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

              <section className="ck-card ck-move">
                <p className="ck">Your winning move</p>
                <h3 className="move-stance">{move?.stance ?? "Open your Map to set your move"}</h3>
                <div className="mixbar" aria-hidden="true">
                  <span className="mix-reno" style={{ width: `${renovateW}%` }} />
                  <span className="mix-e2" style={{ width: `${edge2W}%` }} />
                </div>
                <div className="mix-legend">
                  <span>◆ Master the machine · {renovateW}%</span>
                  {e2 && <span>✦ {e2.label} · {edge2W}%</span>}
                </div>
                {move?.e2short && <p className="move-blurb">{strip(move.e2short)}</p>}
                <div className="stand-foot"><Link href="/hub/build" className="cardlink">Go to Build →</Link></div>
              </section>

              {c?.driver && (
                <section className="ck-card ck-driver">
                  <p className="ck">What&apos;s driving this</p>
                  {c.driver.why && <p className="drv-why">{strip(c.driver.why)}</p>}
                  {c.driver.down && <p className="drv-line"><span className="drv-k">Deepen</span> {strip(c.driver.down)}</p>}
                  {c.driver.action && <p className="drv-action">{strip(c.driver.action)}</p>}
                </section>
              )}

              <section className="ck-card ck-ledger">
                <p className="ck">Your progress</p>
                <div className="ledger">
                  <div className="led"><span className="led-n">{t.movesDone}</span><span className="led-l">moves shipped</span></div>
                  <div className="led"><span className="led-n">{t.movesActive}</span><span className="led-l">in flight</span></div>
                  <div className="led"><span className="led-n">{t.badgeCount}</span><span className="led-l">credentials</span></div>
                  <div className="led"><span className="led-n">{t.editions}</span><span className="led-l">re-scores</span></div>
                </div>
                <Link href="/hub/build" className="cardlink">Train your edges →</Link>
              </section>
            </div>
          </>
        )}

        <div className="hub-sectlabel">The Winning Loop</div>
        <div className="hub-grid">
          <Link href="/hub/map" className="card">
            <p className="ck">🧭 Map</p>
            <h3>{t?.hasMap ? "Re-tune your Map" : "Your Map"}</h3>
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
