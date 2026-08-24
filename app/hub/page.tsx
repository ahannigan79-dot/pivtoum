import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan } from "@/lib/plan";
import { exposureBand, bandWord } from "@/lib/trajectory";
import { getMoves, suggestMoves } from "@/lib/moves";
import { getEarnedBadges } from "@/lib/badges";
import { BADGES } from "@/lib/badges";
import { Trend } from "@/components/hub/dashboard/Trend";
import { MovesPanel } from "@/components/hub/dashboard/MovesPanel";

export const metadata = { title: "Evolve to Win — Pivotum" };

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();
const EDGE2: Record<string, { label: string }> = {
  guard: { label: "Guard your moat" }, shift: { label: "Shift lanes" }, relocate: { label: "Plan your relocate" },
};

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const plan = await getPlan(userId);
  const t = plan?.traj ?? null;
  const c = t?.computed ?? null;

  const [moves, earned] = await Promise.all([
    t?.hasMap ? getMoves(userId) : Promise.resolve({ active: [], shipped: [] }),
    getEarnedBadges(userId),
  ]);
  const suggestions = t?.hasMap ? suggestMoves(c) : [];

  const band = exposureBand(t?.overall ?? null);
  const laneBandWord = bandWord(c?.band);
  const urgency = c?.urgency?.level ?? null;
  const move = c?.move ?? null;
  const e2 = move?.edge2 ? EDGE2[move.edge2] : null;
  const renovateW = move?.weight != null ? 100 - move.weight : 60;
  const edge2W = move?.weight ?? 40;
  const delta = t && t.history.length >= 2 ? t.history[t.history.length - 1].overall - t.history[0].overall : null;

  return (
    <>
      <div className="hub-top"><h1>Evolve to Win</h1><span className="sp" /></div>
      <div className="hub-body">
        {plan && !plan.fullyActivated && (
          <Link href="/hub/welcome" className="newhere">
            <span className="nh-dot" />
            <span>New here? Your <b>Welcome</b> walks you through your opening, step by step.</span>
            <span className="nh-go">Open Welcome →</span>
          </Link>
        )}

        {t?.hasMap ? (
          <>
            {/* Winning strategy — front and centre: what they're working toward */}
            {move?.stance && (
              <section className="strategy">
                <div className="strat-top">
                  <p className="ck">Your winning strategy · what you&apos;re working toward</p>
                  <Link href="/hub/map" className="cardlink">See your full map →</Link>
                </div>
                <h2 className="strat-stance">{move.stance}</h2>
                <div className="mixbar" aria-hidden="true">
                  <span className="mix-reno" style={{ width: `${renovateW}%` }} />
                  <span className="mix-e2" style={{ width: `${edge2W}%` }} />
                </div>
                <div className="mix-legend">
                  <span>◆ Master the machine · {renovateW}%</span>
                  {e2 && <span>✦ {e2.label} · {edge2W}%</span>}
                </div>
                {move.e2short && <p className="strat-line">{strip(move.e2short)}</p>}
              </section>
            )}

            {/* Command KPIs */}
            <div className="kpis">
              <div className={`kpi kpi-exp ${band.cls}`}>
                <span className="kpi-n">{t.overall}</span>
                <span className="kpi-l">Exposure{band.word ? ` · ${band.word}` : ""}</span>
                {delta != null && <span className={`kpi-delta ${delta <= 0 ? "good" : "bad"}`}>{delta <= 0 ? "↓" : "↑"} {Math.abs(delta)}</span>}
              </div>
              <div className="kpi"><span className="kpi-n">{t.movesDone}</span><span className="kpi-l">Moves shipped</span></div>
              <div className="kpi"><span className="kpi-n">{t.movesActive}</span><span className="kpi-l">In flight</span></div>
              <div className="kpi"><span className="kpi-n">{t.badgeCount}</span><span className="kpi-l">Credentials</span></div>
              <div className="kpi"><span className="kpi-n">{t.editions}</span><span className="kpi-l">Re-scores</span></div>
            </div>

            <div className="hub-sectlabel">Where you stand</div>
            <div className="cockpit">
              <section className="ck-card ck-stand">
                <p className="ck">Trajectory{c?.career ? ` · ${c.career}` : ""}</p>
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
                        : delta != null && delta < 0 ? `↓ ${Math.abs(delta)} since you started. That's the direction.`
                        : delta != null && delta > 0 ? `↑ ${delta} — the world moved. Time to pull levers.`
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

              {c?.driver && (
                <section className="ck-card ck-driver">
                  <p className="ck">What&apos;s driving this</p>
                  {c.driver.why && <p className="drv-why">{strip(c.driver.why)}</p>}
                  {c.driver.down && <p className="drv-line"><span className="drv-k">Deepen</span> {strip(c.driver.down)}</p>}
                  {c.driver.action && <p className="drv-action">{strip(c.driver.action)}</p>}
                </section>
              )}
            </div>

            {/* Targets — the moves they control */}
            <div className="hub-sectlabel">Your targets</div>
            <MovesPanel active={moves.active} shipped={moves.shipped} suggestions={suggestions} />

            {/* Achievements */}
            <div className="hub-sectlabel">Achievements</div>
            {earned.length > 0 ? (
              <div className="creds">
                {earned.map((b) => (
                  <span key={b.key} className="cred" title={b.note}><i>{b.icon}</i> {b.name}</span>
                ))}
                {earned.length < BADGES.length && (
                  <span className="cred locked"><i>🔒</i> {BADGES.length - earned.length} more to earn</span>
                )}
              </div>
            ) : (
              <p className="creds-empty">No credentials yet — they&apos;re earned by doing the work: your first Map, first move shipped, first rep.</p>
            )}
          </>
        ) : (
          <div className="cta-hero">
            <div>
              <p className="ck">◆ Activate your dashboard</p>
              <h3>Build your Winning Map</h3>
              <p>Your command dashboard comes alive once you&apos;ve mapped where you stand. New here? Start with your Welcome.</p>
            </div>
            <div className="cta-hero-actions">
              <Link href="/hub/map" className="btn-primary">Build your Map →</Link>
              <Link href="/hub/welcome" className="btn-ghost">Open Welcome</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
