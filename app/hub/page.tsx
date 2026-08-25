import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan } from "@/lib/plan";
import { exposureBand, bandWord } from "@/lib/trajectory";
import { getMoves, suggestMoves, winningAim } from "@/lib/moves";
import { getEarnedBadges, evaluateBadges, BADGES } from "@/lib/badges";
import { getMemberActivity, computeEffort, effortBreakdown } from "@/lib/effort";
import { getCurrentPrompt } from "@/lib/ritual";
import { articleRef } from "@/lib/brief";
import { Trend } from "@/components/hub/dashboard/Trend";
import { Gauge } from "@/components/hub/dashboard/Gauge";
import { MovesPanel } from "@/components/hub/dashboard/MovesPanel";
import { MapRead } from "@/components/hub/dashboard/MapRead";
import { ArticleWhy } from "@/components/hub/dashboard/ArticleWhy";

export const metadata = { title: "Evolve to Win — Pivotum" };

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();
const EDGE2: Record<string, { label: string }> = {
  guard: { label: "Guard your moat" }, shift: { label: "Shift lanes" }, relocate: { label: "Plan your relocate" },
};

type Reminder = { icon: string; text: string; href: string; tone?: string };

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const { userId } = await auth();
  const plan = await getPlan(userId);
  const t = plan?.traj ?? null;
  const c = t?.computed ?? null;

  const activity = userId ? await getMemberActivity(userId) : null;
  if (userId && activity) await evaluateBadges(userId, activity); // catch up on milestone credentials
  const effort = activity ? computeEffort(activity) : 0;
  const breakdown = activity ? effortBreakdown(activity) : [];

  const [moves, earned, prompt] = await Promise.all([
    t?.hasMap ? getMoves(userId) : Promise.resolve({ active: [], shipped: [] }),
    getEarnedBadges(userId),
    getCurrentPrompt(),
  ]);
  const suggestions = t?.hasMap ? suggestMoves(c) : [];
  const promptArticle = articleRef(prompt?.articleSlug);
  // Recently-earned credentials → an "earned moment" (last 48h).
  const recent = earned.filter((b) => Date.now() - new Date(b.earnedAt).getTime() < 48 * 3600 * 1000);
  const shippedSinceRescore = !!(t?.hasMap && t.lastMapAt && moves.shipped.some((m) => m.completedAt && m.completedAt > t.lastMapAt!));

  // Effort dividend — the work you put in buys down exposure. Every 30 points = −1,
  // capped at −12 so it rewards effort without overwhelming the market baseline.
  const EFFORT_PER_POINT = 30, EFFORT_CAP = 12;
  const effortDividend = Math.min(EFFORT_CAP, Math.floor(effort / EFFORT_PER_POINT));
  const baseExp = t?.overall ?? null;
  const exposureNow = baseExp != null ? Math.max(3, Math.min(97, baseExp - effortDividend)) : null;

  const band = exposureBand(exposureNow);
  const laneBandWord = bandWord(c?.band);
  const urgency = c?.urgency?.level ?? null;
  const move = c?.move ?? null;
  const e2 = move?.edge2 ? EDGE2[move.edge2] : null;
  const renovateW = move?.weight != null ? 100 - move.weight : 60;
  const edge2W = move?.weight ?? 40;
  const delta = t && t.history.length >= 2 ? t.history[t.history.length - 1].overall - t.history[0].overall : null;
  const dd = c?.driverDetail ?? null;

  // "To evolve to win" — reminders auto-generated from the Map, Build, and activity.
  const stepDone = (k: string) => plan?.steps.find((s) => s.key === k)?.done ?? false;
  const months = Math.max(2, Math.round((t?.daysSinceMap ?? 60) / 30));
  const reminders: Reminder[] = [];
  if (t?.hasMap) {
    if (!stepDone("welcome")) reminders.push({ icon: "📅", text: "Book your 1:1 welcome with Adam", href: "/hub/events/welcome" });
    if (t.personalRescoreDue) reminders.push({ icon: "🔄", text: `Re-score your protections — it's been ${months} months`, href: "/hub/map", tone: "warn" });
    else if (shippedSinceRescore) reminders.push({ icon: "🔄", text: "You've shipped moves — re-score to see your exposure move", href: "/hub/map", tone: "warn" });
    if (moves.active.length === 0) reminders.push({ icon: "◆", text: "Turn your winning move into a commitment", href: "#moves" });
    else reminders.push({ icon: "🚀", text: `Keep shipping — ${moves.active.length} move${moves.active.length > 1 ? "s" : ""} in flight`, href: "#moves" });
    if (!stepDone("build")) reminders.push({ icon: "🥊", text: "Train your judgment — log a Build rep", href: "/hub/build" });
    if (!stepDone("learn")) reminders.push({ icon: "📚", text: "Learn your six levers", href: "/hub/learn" });
    if (stepDone("pod")) reminders.push({ icon: "👥", text: "Check in with your pod this week", href: "/hub/pods" });
    else reminders.push({ icon: "👥", text: "Join your Together Pod", href: "/hub/pods/browse" });
  }
  const shownReminders = reminders.slice(0, 5);

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

        {recent.length > 0 && (
          <div className="earned">
            <span className="earned-spark">✨</span>
            <span>You earned {recent.length === 1 ? "a new credential" : `${recent.length} new credentials`}: <b>{recent.map((b) => b.name).join(", ")}</b> — the work is showing.</span>
          </div>
        )}

        {prompt && (
          <div className="week-prompt-wrap">
            <Link href="/hub/community" className="week-prompt week-prompt-link">
              <span className="wp-tag">This week</span>
              <div className="wp-main">
                <h3>{prompt.title}</h3>
                <p>{prompt.body}</p>
                <span className="wp-cta">Join the conversation →</span>
              </div>
            </Link>
            {promptArticle && (
              <>
                <a href={promptArticle.url} className="wp-article" target="_blank" rel="noopener noreferrer">
                  <span className="wp-article-k">The thinking behind this</span>
                  <span className="wp-article-t">{promptArticle.title} →</span>
                </a>
                <ArticleWhy />
              </>
            )}
          </div>
        )}

        {t?.hasMap ? (
          <>
            {/* Winning strategy — front and centre: what they're working toward */}
            {move?.stance && (
              <section className="strategy">
                <div className="strat-top">
                  <p className="ck">What you&apos;re aiming for · grounded in your AI impact</p>
                  <Link href="/hub/map" className="cardlink">See your full map →</Link>
                </div>
                <h2 className="strat-stance">{winningAim(move.edge2, band.cls)}</h2>
                <p className="strat-via">Your strategy: <b>{move.stance}</b></p>
                <div className="mixbar" aria-hidden="true">
                  <span className="mix-reno" style={{ width: `${renovateW}%` }} />
                  <span className="mix-e2" style={{ width: `${edge2W}%` }} />
                </div>
                <div className="mix-legend">
                  <span>◆ Master the machine · {renovateW}%</span>
                  {e2 && <span>✦ {e2.label} · {edge2W}%</span>}
                </div>
              </section>
            )}

            {/* Adam's read — Claude's in-voice narrative of their Map, grounded in `computed` */}
            <MapRead />

            {/* Command KPIs */}
            <div className="kpis">
              <div className={`kpi kpi-exp ${band.cls}`}>
                <span className="kpi-n">{exposureNow}</span>
                <span className="kpi-l">Exposure{band.word ? ` · ${band.word}` : ""}{effortDividend > 0 ? ` · −${effortDividend} effort` : ""}</span>
                {delta != null && <span className={`kpi-delta ${delta <= 0 ? "good" : "bad"}`}>{delta <= 0 ? "↓" : "↑"} {Math.abs(delta)}</span>}
              </div>
              <div className="kpi"><span className="kpi-n">{t.movesDone}</span><span className="kpi-l">Moves shipped</span></div>
              <div className="kpi"><span className="kpi-n">{t.movesActive}</span><span className="kpi-l">In flight</span></div>
              <div className="kpi"><span className="kpi-n">{t.badgeCount}</span><span className="kpi-l">Credentials</span></div>
              <div className="kpi"><span className="kpi-n">{t.editions}</span><span className="kpi-l">Re-scores</span></div>
            </div>

            {/* Effort — the work put in. Only goes up; a key factor in winning. */}
            <section className="effort">
              <div className="effort-main">
                <span className="effort-n">{effort}</span>
                <div className="effort-copy">
                  <p className="ck">Your effort · putting in the work</p>
                  <p className="effort-lead">Winning isn&apos;t just your exposure — it&apos;s the work you put in to change it. Every move, rep, re-score and contribution adds up, and it only goes up.</p>
                  {effortDividend > 0 ? (
                    <p className="effort-div">Your effort has pulled your exposure down <b>−{effortDividend}</b>{baseExp != null ? ` (${baseExp} → ${exposureNow})` : ""}. Every {EFFORT_PER_POINT} points earns −1, up to −{EFFORT_CAP}.</p>
                  ) : effort > 0 ? (
                    <p className="effort-div"><b>{EFFORT_PER_POINT - (effort % EFFORT_PER_POINT)}</b> more points earns your first −1 on exposure.</p>
                  ) : null}
                </div>
              </div>
              {breakdown.length > 0 && (
                <div className="effort-break">
                  {breakdown.map((b, i) => <span key={i} className="eb"><b>{b.n}</b> {b.label}</span>)}
                </div>
              )}
            </section>

            <div className="hub-sectlabel">Where you stand</div>
            <div className="cockpit">
              <section className="ck-card ck-stand">
                <p className="ck">Where you stand{c?.career ? ` · ${c.career}` : ""}</p>
                <Gauge value={exposureNow ?? 0} avg={c?.personal?.laneBaseline ?? null} />
                <div className="stand-mini">
                  {t.history.length >= 2 && <span className="stand-spark"><Trend points={t.history} /></span>}
                  <span className="trend-note">
                    {t.history.length < 2
                      ? "Your first reading — your line starts building at your next re-score."
                      : delta != null && delta < 0 ? `↓ ${Math.abs(delta)} since you started. That's the direction — keep pulling levers.`
                      : delta != null && delta > 0 ? `↑ ${delta} — the market moved. Time to pull levers.`
                      : "Holding steady across re-scores."}
                  </span>
                </div>
                <div className="stand-foot">
                  {c?.lane && <span className="tag">{c.lane}{laneBandWord ? ` · ${laneBandWord} risk` : ""}</span>}
                  {urgency && <span className={`tag urg u-${urgency.toLowerCase()}`}>Urgency: {urgency}</span>}
                  <Link href="/hub/map" className="cardlink">Open your Map →</Link>
                </div>
                <p className="rescore-cadence">Personal re-score every 2 months · Pivotum re-scores the market every 6.</p>
              </section>

              <section className="ck-card ck-driver">
                <p className="ck">What&apos;s driving this{c?.driver?.name ? ` · ${c.driver.name}` : ""}</p>
                {dd?.why ? (
                  <p className="drv-why">{strip(dd.why)}</p>
                ) : (
                  <p className="drv-why">Your exposure is driven mainly by {c?.driver?.name ?? "market automatability"}. Re-open your Map for the full read, then re-score to refresh this.</p>
                )}
                {dd?.down && <p className="drv-line"><span className="drv-k">Deepen</span> {strip(dd.down)}</p>}
                {dd?.action && <p className="drv-action">{strip(dd.action)}</p>}
                {c?.personal && c.personal.laneBaseline != null && (
                  <div className="drv-personal">
                    <p className="drv-line">
                      <span className="drv-k">You vs your lane</span>
                      Your lane averages <b>{c.personal.laneBaseline}</b>. You&apos;re at <b>{baseExp}</b> —{" "}
                      {(c.personal.delta ?? 0) < 0
                        ? <span className="pos">{Math.abs(c.personal.delta ?? 0)} better than average</span>
                        : (c.personal.delta ?? 0) > 0
                          ? <span className="neg">{c.personal.delta} worse than average</span>
                          : <span>right at the average</span>}.
                    </p>
                    {c.personal.helps && c.personal.helps.length > 0 && (
                      <p className="drv-line"><span className="drv-k pos-k">Working for you</span> {c.personal.helps.join(", ")}</p>
                    )}
                    {c.personal.hurts && c.personal.hurts.length > 0 && (
                      <p className="drv-line"><span className="drv-k neg-k">Holding you back</span> {c.personal.hurts.join(", ")}</p>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* To evolve to win — automated reminders from map, build, activity */}
            {shownReminders.length > 0 && (
              <>
                <div className="hub-sectlabel">To evolve to win</div>
                <div className="reminders">
                  {shownReminders.map((r, i) => (
                    <Link key={i} href={r.href} className={"reminder" + (r.tone ? ` ${r.tone}` : "")}>
                      <span className="rem-ic">{r.icon}</span>
                      <span className="rem-text">{r.text}</span>
                      <span className="rem-go">→</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Your moves — commitments you control */}
            <div className="hub-sectlabel" id="moves">Your moves</div>
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
