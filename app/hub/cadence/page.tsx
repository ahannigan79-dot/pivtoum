import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { CURRICULUM, activeMonth, weekOfMonth } from "@/lib/cadence";
import { getCadenceState } from "@/lib/cadence-state";
import { setCadence, scheduleCadenceEvents } from "./actions";

export const metadata = { title: "Cadence — Winning in the Age of AI" };

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default async function CadencePage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();

  const { pinnedKey, scheduledKey } = await getCadenceState();
  const now = new Date();
  const m = activeMonth(pinnedKey, now);
  const week = weekOfMonth(now);
  const pinned = !!pinnedKey;
  const scheduled = scheduledKey === m.key;

  return (
    <>
      <div className="hub-top"><h1>Cadence</h1><span className="sp" /><span className="hub-pill">Founder view</span></div>
      <div className="hub-body cadence">
        <p className="hub-lead">
          One dial drives the community month. Set it — or let the calendar advance it — and the whole
          month follows: this week&apos;s prompt, the events to schedule, the reps muscle, the Learn lesson,
          and the pod session. The Winning Year runs October → September.
        </p>

        {/* Active month */}
        <section className="cad-now">
          <div className="cad-now-head">
            <div>
              <span className="cad-tag">{m.tag} · Month {m.order} of 12</span>
              <h2>{m.subject}</h2>
              <p className="cad-anchor">
                Anchored to {MONTH_NAMES[m.calMonth]} · currently week {week} of 4
                {pinned ? " · pinned" : " · following the calendar"}
                {m.reScore ? " · re-score month" : ""}
              </p>
            </div>
            <form action={setCadence} className="cad-steps">
              <button name="op" value="back" className="ghost" title="Previous month">←</button>
              <button name="op" value="advance" className="ghost" title="Next month">→</button>
              {pinned && <button name="op" value="clear" className="ghost">Follow calendar</button>}
            </form>
          </div>

          <p className="cad-lesson"><span className="cad-k">Learn</span> {m.lesson}</p>

          <div className="cad-prompt-now">
            <span className="cad-k">This week&apos;s prompt · week {week}</span>
            <p>{m.prompts[week - 1]}</p>
          </div>

          <div className="cad-grid">
            <div><span className="cad-k">Founder Q&amp;A</span><p>{m.qa}</p></div>
            <div><span className="cad-k">SME session</span><p>{m.sme.topic}</p><p className="cad-sub">{m.sme.profile}</p></div>
            <div><span className="cad-k">Pod session</span><p>{m.pod}</p></div>
            <div><span className="cad-k">Reps muscle</span><p>{m.repsMuscle}</p></div>
          </div>

          <div className="cad-prompts-all">
            <span className="cad-k">The month&apos;s four prompts</span>
            <ol>
              {m.prompts.map((p, i) => (
                <li key={i} className={i === week - 1 ? "on" : ""}><b>W{i + 1}</b> {p}</li>
              ))}
            </ol>
          </div>

          <div className="cad-events">
            <div className="cad-events-head">
              <span className="cad-k">Flagship events this month</span>
              <form action={scheduleCadenceEvents}>
                <button type="submit" disabled={scheduled}>
                  {scheduled ? "Scheduled ✓" : "Schedule this month’s events"}
                </button>
              </form>
            </div>
            {m.events.length === 0
              ? <p className="cad-sub">No flagship events templated this month.</p>
              : (
                <ul className="cad-evlist">
                  {m.events.map((e, i) => (
                    <li key={i}>
                      <span className={"event-type t-" + e.type}>{e.type.replace(/_/g, " ")}</span>
                      <b>{e.title}</b> <span className="cad-sub">· week {e.when}</span>
                      {e.desc && <p className="cad-sub">{e.desc}</p>}
                    </li>
                  ))}
                </ul>
              )}
            <p className="cad-sub">Scheduling adds them to the Events calendar for this calendar month. Idempotent — it skips any already on the calendar. Set join links and recordings from Events.</p>
          </div>
        </section>

        {/* The year at a glance */}
        <section className="cad-year">
          <div className="hub-sectlabel">The Winning Year</div>
          <div className="cad-year-grid">
            {CURRICULUM.map((cm) => {
              const isActive = cm.key === m.key;
              return (
                <form action={setCadence} key={cm.key} className={"cad-mcard" + (isActive ? " on" : "")}>
                  <input type="hidden" name="op" value="pin" />
                  <input type="hidden" name="key" value={cm.key} />
                  <button type="submit" title={`Pin to ${cm.subject}`}>
                    <span className="cad-mtag">{MONTH_NAMES[cm.calMonth].slice(0, 3)} · {cm.tag}</span>
                    <b>{cm.subject}</b>
                    {cm.reScore && <span className="cad-re">re-score</span>}
                  </button>
                </form>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
