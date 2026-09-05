import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan } from "@/lib/plan";
import { onboardingView } from "@/lib/onboarding";
import { exposureBand, bandWord } from "@/lib/trajectory";
import { getMoves, suggestMoves, winningAim } from "@/lib/moves";
import { getEarnedBadges, evaluateBadges, BADGES } from "@/lib/badges";
import { getMemberActivity } from "@/lib/effort";
import { qualifyingMonths } from "@/lib/gym-gate";
import { getCurrentPrompt } from "@/lib/ritual";
import { activeCadenceMonth } from "@/lib/cadence-state";
import { weekOfMonth } from "@/lib/cadence";
import { resolvePromptArticle } from "@/lib/brief";
import { ExposureJourney, type JourneyPoint } from "@/components/hub/dashboard/ExposureJourney";
import { currentExposure, clampScore } from "@/lib/score";
import { getLaneOverride } from "@/lib/baselines";
import { MovesPanel } from "@/components/hub/dashboard/MovesPanel";
import { MapRead } from "@/components/hub/dashboard/MapRead";
import { Icon } from "@/components/hub/Icon";
import { ArticleWhy } from "@/components/hub/dashboard/ArticleWhy";

export const metadata = { title: "The Evolve Dashboard — Pivotum" };

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();

type Reminder = { icon: string; text: string; href: string; tone?: string };

export default async function Dashboard() {
  const profile = await getOrCreateProfile();
  const { userId } = await auth();
  const plan = await getPlan(userId);
  const onb = plan ? onboardingView(plan) : null;
  const setupActive = !!(onb && !onb.complete); // guided setup still running → show the rail stepper, and hide reminders it already covers
  const t = plan?.traj ?? null;
  const c = t?.computed ?? null;

  const activity = userId ? await getMemberActivity(userId) : null;
  if (userId && activity) await evaluateBadges(userId, activity); // catch up on milestone credentials

  const [moves, earned, prompt, cadence] = await Promise.all([
    t?.hasMap ? getMoves(userId) : Promise.resolve({ active: [], shipped: [] }),
    getEarnedBadges(userId),
    getCurrentPrompt(),
    activeCadenceMonth(),
  ]);
  const cadenceWeekPrompt = cadence.prompts[weekOfMonth() - 1];
  const suggestions = t?.hasMap ? suggestMoves(c) : [];
  const promptArticle = resolvePromptArticle(prompt);
  // Recently-earned credentials → an "earned moment" (last 48h).
  const recent = earned.filter((b) => Date.now() - new Date(b.earnedAt).getTime() < 48 * 3600 * 1000);
  const shippedSinceRescore = !!(t?.hasMap && t.lastMapAt && moves.shipped.some((m) => m.completedAt && m.completedAt > t.lastMapAt!));

  // Market baseline: if Pivotum has re-scored this member's lane, apply the shift.
  // Their saved score already carries their old baseline + personal, so we move it
  // by (new baseline − old baseline) — earned improvement (personal + effort) rides along.
  const savedBaseline = c?.personal?.laneBaseline ?? null;
  const laneOverride = await getLaneOverride(profile?.careerSlug, profile?.currentLane);
  const marketShift = laneOverride != null && savedBaseline != null ? laneOverride - savedBaseline : 0;

  // Effort dividend — earned by doing the work: each month a member passes ≥8 reps
  // (≥75%) and is active ≥3 of 4 weeks buys down one point of exposure, capped at 12
  // total, so exposure comes down as a journey, not a sprint. (See lib/gym-gate.ts.)
  const effortDividend = await qualifyingMonths(userId);
  const baseExp = t?.overall != null ? t.overall + marketShift : null;
  const exposureNow = baseExp != null ? currentExposure(baseExp, effortDividend) : null;

  const band = exposureBand(exposureNow);
  const laneBandWord = bandWord(c?.band);
  const urgency = c?.urgency?.level ?? null;
  const move = c?.move ?? null;
  const dd = c?.driverDetail ?? null;

  // The two figures that lead the dashboard: where you are today, and how far
  // you've moved from your first reading. `startExp` is that first baseline;
  // `improvement` is positive when today's score is lower (better) than it.
  const startExp = t?.history?.[0]?.overall ?? baseExp;
  const improvement = startExp != null && exposureNow != null ? startExp - exposureNow : null;

  // The journey: every saved Map is a node (first = baseline, rest = re-scores),
  // and — when effort has bought exposure down since the last re-score — today
  // is appended as a final node, the drop to it being the effort dividend.
  const fmtMonth = (d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  const journey: JourneyPoint[] = [];
  if (t?.hasMap) {
    t.history.forEach((h, i) => {
      const prev = i > 0 ? t.history[i - 1] : null;
      // A re-score is a "market" node when the Pivotum baseline moved between saves;
      // otherwise it's the member's own personal re-score.
      const marketMoved = !!(prev && prev.laneBaseline != null && h.laneBaseline != null && h.laneBaseline !== prev.laneBaseline);
      journey.push({
        value: h.overall,
        label: i === 0 ? "Baseline" : marketMoved ? "Market re-score" : "Re-score",
        sub: i === 0 ? fmtMonth(h.at) : marketMoved ? `Baseline ${prev!.laneBaseline}→${h.laneBaseline}` : fmtMonth(h.at),
        kind: i === 0 ? "baseline" : marketMoved ? "market" : "rescore",
      });
    });
    // A live Pivotum re-score (baseline moved since the last saved Map) shows as its
    // own node before today, so the member sees exactly what the market did.
    if (marketShift !== 0 && savedBaseline != null && laneOverride != null && journey.length) {
      const lastOverall = t.history[t.history.length - 1].overall;
      journey.push({
        value: clampScore(lastOverall + marketShift),
        label: "Market re-score",
        sub: `Baseline ${savedBaseline}→${laneOverride}`,
        kind: "market",
      });
    }
    if (effortDividend > 0 && exposureNow != null) {
      journey.push({ value: exposureNow, label: "Today", sub: `Effort dividend −${effortDividend}`, kind: "today" });
    } else if (journey.length) {
      journey[journey.length - 1] = { ...journey[journey.length - 1], label: "Today", kind: "today" };
    }
  }

  // "To evolve to win" — reminders auto-generated from the Map, Build, and activity.
  const stepDone = (k: string) => plan?.steps.find((s) => s.key === k)?.done ?? false;
  const months = Math.max(2, Math.round((t?.daysSinceMap ?? 60) / 30));
  const reminders: Reminder[] = [];
  if (t?.hasMap) {
    // While guided setup is running, the rail stepper is the one place for
    // setup actions (welcome, move, learn, pod-join) — don't repeat them here.
    if (!stepDone("welcome") && !setupActive) reminders.push({ icon: "events", text: "Book your 1:1 welcome with Adam", href: "/hub/events/welcome" });
    if (t.personalRescoreDue) reminders.push({ icon: "evolve", text: `Re-score your protections — it's been ${months} months`, href: "/hub/map", tone: "warn" });
    else if (shippedSinceRescore) reminders.push({ icon: "evolve", text: "You've shipped moves — re-score to see your exposure move", href: "/hub/map", tone: "warn" });
    if (moves.active.length === 0 && !setupActive) reminders.push({ icon: "playbook", text: "Turn your winning move into a commitment", href: "#moves" });
    else if (moves.active.length > 0) reminders.push({ icon: "build", text: `Keep shipping — ${moves.active.length} move${moves.active.length > 1 ? "s" : ""} in flight`, href: "#moves" });
    if (!stepDone("build")) reminders.push({ icon: "build", text: "Train your judgment — log a Build rep", href: "/hub/build" });
    if (!stepDone("learn") && !setupActive) reminders.push({ icon: "learn", text: "Learn your six levers", href: "/hub/learn" });
    if (stepDone("pod")) reminders.push({ icon: "pods", text: "Check in with your pod this week", href: "/hub/pods" });
    else if (!setupActive) reminders.push({ icon: "pods", text: "Join your Together Pod", href: "/hub/pods/browse" });
  }
  const shownReminders = reminders.slice(0, 5);

  return (
    <>
      <div className="hub-top"><h1>The Evolve Dashboard</h1><span className="sp" /></div>
      <div className="hub-body">
        {recent.length > 0 && (
          <div className="earned">
            <span className="earned-spark"><Icon name="done" size={16} /></span>
            <span>You earned {recent.length === 1 ? "a new credential" : `${recent.length} new credentials`}: <b>{recent.map((b) => b.name).join(", ")}</b> — the work is showing.</span>
          </div>
        )}

        {t?.hasMap && (
          <Link href="/hub/community" className="month-band">
            <span className="mb-tag">This month{cadence.reScore ? " · re-score" : ""}</span>
            <div className="mb-main">
              <h3>{cadence.subject}</h3>
              <p>{cadenceWeekPrompt}</p>
            </div>
            <span className="mb-go">→</span>
          </Link>
        )}

        {t?.hasMap && prompt && (
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
          <div className={setupActive ? "dash" : "dash dash-solo"}>
            <div className="dash-col">
            {/* The lead: your exposure today, and how far you've moved from baseline. */}
            <section className="escore">
              <div className="escore-head">
                <p className="ck">Your exposure today{c?.career ? ` · ${c.career}` : ""}</p>
                <Link href="/hub/map" className="cardlink">Open your Map →</Link>
              </div>
              {move?.stance && <h2 className="escore-aim">{winningAim(move.edge2, band.cls)}</h2>}
              <div className="escore-nums">
                <div className="escore-stat">
                  <span className="escore-stat-n">{exposureNow}</span>
                  <span className="escore-stat-l">Current Exposure{band.word ? ` · ${band.word}` : ""}</span>
                </div>
                {improvement != null && t.history.length >= 2 && (
                  <div className={`escore-stat ${improvement > 0 ? "good" : improvement < 0 ? "bad" : ""}`}>
                    <span className="escore-stat-n">{improvement > 0 ? "↓ " : improvement < 0 ? "↑ " : ""}{Math.abs(improvement)}</span>
                    <span className="escore-stat-l">Exposure Improvement{improvement < 0 ? " · rose" : ""}</span>
                  </div>
                )}
              </div>

              {journey.length >= 2 ? (
                <ExposureJourney points={journey} />
              ) : (
                <p className="escore-firstread">Your first reading — your journey line starts building at your next re-score.</p>
              )}

              <div className="escore-foot">
                {move?.stance && <span className="tag">Your play · {move.stance}</span>}
                {c?.lane && <span className="tag">{c.lane}{laneBandWord ? ` · ${laneBandWord} risk` : ""}</span>}
                {urgency && <span className={`tag urg u-${urgency.toLowerCase()}`}>Urgency: {urgency}</span>}
              </div>
              <p className="rescore-cadence">Personal re-score every 2 months · Pivotum re-scores the market every 6.</p>
            </section>

            {/* Adam's read — Claude's in-voice narrative of their Map, grounded in `computed` */}
            <MapRead />

            {/* What's driving this — the single reason behind the score */}
            <section className="ck-card ck-driver ck-driver-solo">
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
                  {((c.personal.helps?.length ?? 0) > 0 || (c.personal.hurts?.length ?? 0) > 0) && (
                    <div className="drv-split">
                      <div className="drv-half">
                        <div className="drv-ht keep"><span className="d" />What stays yours</div>
                        <ul>
                          {(c.personal.helps ?? []).map((h, i) => <li key={i}>{h}</li>)}
                          {(c.personal.helps?.length ?? 0) === 0 && <li>Judgment, trust and the calls only you can make</li>}
                        </ul>
                      </div>
                      <div className="drv-half">
                        <div className="drv-ht exp"><span className="d" />Holding you back</div>
                        <ul>
                          {(c.personal.hurts ?? []).map((h, i) => <li key={i}>{h}</li>)}
                          {(c.personal.hurts?.length ?? 0) === 0 && <li>The routine, repeatable volume AI handles well</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* The rest of your numbers, kept quiet — the score above is the point.
                While setup is running, these live in the rail as tiles instead. */}
            {!setupActive && (
              <div className="statline">
                <span><b>{t.movesDone}</b> shipped</span>
                <span><b>{t.movesActive}</b> in flight</span>
                <span><b>{t.editions}</b> re-scores</span>
                <span><b>{t.badgeCount}</b> credentials</span>
              </div>
            )}

            {/* To evolve to win — automated reminders from map, build, activity */}
            {shownReminders.length > 0 && (
              <>
                <div className="hub-sectlabel">To evolve to win</div>
                <div className="reminders">
                  {shownReminders.map((r, i) => (
                    <Link key={i} href={r.href} className={"reminder" + (r.tone ? ` ${r.tone}` : "")}>
                      <span className="rem-ic"><Icon name={r.icon} size={17} /></span>
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
                  <span key={b.key} className="cred" title={b.note}>{b.name}</span>
                ))}
                {earned.length < BADGES.length && (
                  <span className="cred locked">{BADGES.length - earned.length} more to earn</span>
                )}
              </div>
            ) : (
              <p className="creds-empty">No credentials yet — they&apos;re earned by doing the work: your first Map, first move shipped, first rep.</p>
            )}
            </div>

            {setupActive && onb && (
              <aside className="dash-rail">
                <section className="card setup-card">
                  <div className="setup-head">
                    <p className="ck">Get set up</p>
                    <span className="setup-count">{onb.doneCount} / {onb.total} done</span>
                  </div>
                  <div className="setup-bar"><i style={{ width: `${Math.round((onb.doneCount / onb.total) * 100)}%` }} /></div>
                  <div className="steps">
                    {onb.steps.map((s) => {
                      const state = s.done ? "done" : onb.current && s.key === onb.current.key ? "now" : s.locked ? "locked" : "";
                      return (
                        <div key={s.key} className={`stp ${state}`}>
                          <span className="mk">{s.done ? "✓" : ""}</span>
                          <div>
                            <span className="sl">{s.label}</span>
                            {state === "now" && <div className="sb">{s.blurb}</div>}
                            {state === "now" && <Link href={s.href} className="scta btn btn-primary">{s.cta} →</Link>}
                            {state === "locked" && s.lockNote && <div className="sb">{s.lockNote}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="card setup-card">
                  <p className="ck">Your progress</p>
                  <div className="rail-tiles">
                    <div className="rail-tile"><div className="tn">{t.movesDone}</div><div className="tl">Shipped</div></div>
                    <div className="rail-tile"><div className="tn">{t.movesActive}</div><div className="tl">In flight</div></div>
                    <div className="rail-tile"><div className="tn">{t.editions}</div><div className="tl">Re-scores</div></div>
                    <div className="rail-tile"><div className="tn">{t.badgeCount}</div><div className="tl">Credentials</div></div>
                  </div>
                </section>
              </aside>
            )}
          </div>
        ) : (
          <section className="welcome-hero">
            <p className="ck">Welcome to Pivotum</p>
            <h2>See exactly where AI leaves your career standing — and your opening.</h2>
            <p className="welcome-lede">Your dashboard comes alive the moment you build your Winning Map — your exposure score, the lanes AI is coming for, and the one move that turns exposure into your edge. About two minutes.</p>
            <div className="welcome-steps">
              <div className="wstep"><span className="wstep-n">1</span><div className="wstep-t"><b>Build your Map</b><span>Where you stand, scored by lane.</span></div></div>
              <div className="wstep"><span className="wstep-n">2</span><div className="wstep-t"><b>Find your move</b><span>The edge that compounds.</span></div></div>
              <div className="wstep"><span className="wstep-n">3</span><div className="wstep-t"><b>Meet your pod</b><span>A small team in your exact lane.</span></div></div>
            </div>
            <div className="welcome-actions">
              <Link href="/hub/map" className="btn-primary">Build your Map →</Link>
              <Link href="/hub/welcome" className="btn-ghost">Take the guided Welcome</Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
