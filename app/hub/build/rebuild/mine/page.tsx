import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { aiConfigured } from "@/lib/ai";
import { latestTransform, daysUntilNext, type Transformation } from "@/lib/workflow-transform";
import { TransformForm } from "@/components/hub/build/TransformForm";

export const metadata = { title: "Rebuild my workflow — Winning in the Age of AI" };

function Doc({ workflow, doc, when }: { workflow: string; doc: Transformation; when: Date }) {
  const date = new Date(when).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <article className="wtdoc">
      <header className="wt-head">
        <p className="ck">Workflow transformation</p>
        <h2>{workflow}</h2>
        <p className="wt-thesis">{doc.thesis}</p>
        <p className="wt-meta">Prepared {date} · an opportunity for how we run this work</p>
      </header>

      <section className="wt-sect">
        <h3>The workflow today</h3>
        <ul className="wt-steps">
          {doc.today.map((s, i) => (
            <li key={i}><b>{s.step}</b><span>{[s.who, s.time].filter(Boolean).join(" · ")}</span></li>
          ))}
        </ul>
      </section>

      <section className="wt-sect">
        <h3>Rebuilt AI-native</h3>
        <ul className="wt-steps">
          {doc.rebuilt.map((s, i) => (
            <li key={i}><b>{s.step} <span className={"wt-own o-" + s.owner.replace(/\W/g, "").toLowerCase()}>{s.owner}</span></b><span>{s.detail}</span></li>
          ))}
        </ul>
      </section>

      <div className="wt-two">
        <section className="wt-sect">
          <h3>What changes</h3>
          <ul className="wt-bul">{doc.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </section>
        {doc.peopleMove.length > 0 && (
          <section className="wt-sect">
            <h3>Where the people move up to</h3>
            <ul className="wt-bul wt-good">{doc.peopleMove.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>
        )}
      </div>

      <section className="wt-sect">
        <h3>The gains</h3>
        <div className="wt-value">
          {doc.value.map((v, i) => (
            <div key={i} className="wt-val"><span className="wt-val-a">{v.area}</span><span className="wt-val-g">{v.gain}</span></div>
          ))}
        </div>
      </section>

      {doc.risks.length > 0 && (
        <section className="wt-sect">
          <h3>Risks &amp; the safeguards</h3>
          <ul className="wt-risks">
            {doc.risks.map((r, i) => (
              <li key={i}><b>{r.risk}</b><span><em>Safeguard:</em> {r.safeguard}</span></li>
            ))}
          </ul>
        </section>
      )}

      <div className="wt-two">
        {doc.pilot.scope && (
          <section className="wt-sect">
            <h3>What a pilot needs</h3>
            <p className="wt-p">{doc.pilot.scope}</p>
            {doc.pilot.needs.length > 0 && <ul className="wt-bul">{doc.pilot.needs.map((n, i) => <li key={i}>{n}</li>)}</ul>}
            {doc.pilot.owner && <p className="wt-owner">Owner: <b>{doc.pilot.owner}</b></p>}
          </section>
        )}
        {doc.rollout.length > 0 && (
          <section className="wt-sect">
            <h3>Rollout</h3>
            <ul className="wt-roll">
              {doc.rollout.map((r, i) => <li key={i}><b>{r.phase}</b><span>{r.detail}</span></li>)}
            </ul>
          </section>
        )}
      </div>

      {doc.measure.length > 0 && (
        <section className="wt-sect">
          <h3>What to measure</h3>
          <ul className="wt-bul">{doc.measure.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </section>
      )}

      <p className="wt-foot">Drafted with Pivotum · Winning in the Age of AI. The judgment, the ownership and the pitch are yours.</p>
    </article>
  );
}

export default async function MyWorkflowPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { userId } = await auth();
  const { err } = await searchParams;
  const [profile, last] = await Promise.all([getOrCreateProfile(), userId ? latestTransform(userId) : Promise.resolve(null)]);
  const wait = daysUntilNext(last?.createdAt);
  const canGen = aiConfigured() && wait === 0;

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build/rebuild" className="back">‹ Workflow Rebuild</Link><span className="tt">Rebuild my workflow</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">Put yourself in the driver's seat</p>
          <h2>Rebuild your own workflow, AI-native.</h2>
          <p>Describe a workflow you actually run. Pivotum rebuilds it AI-native and hands you a sharp, boss-shareable transformation doc — what changes, where the risks are, where your people move up, and the gains. The artifact that makes you the person who saw it first.</p>
        </div>

        {err === "limit" && <p className="wt-alert">You've used this month's rebuild. It refreshes so each one is worth doing — your latest is below.</p>}
        {err === "failed" && <p className="wt-alert">That didn't come through. Give it another go in a moment.</p>}
        {err === "input" && <p className="wt-alert">Add the workflow name and how it's done today, then try again.</p>}

        {canGen ? (
          <div className="wt-formwrap"><TransformForm role={profile?.displayName ?? ""} /></div>
        ) : !aiConfigured() ? (
          <p className="wt-alert">Workflow rebuild isn&apos;t available just yet.</p>
        ) : (
          <div className="wt-locked">
            <p><b>Next rebuild in {wait} day{wait === 1 ? "" : "s"}.</b> One per month keeps each one worth the effort. Your latest is below — share it, act on it, bring it to your lead.</p>
          </div>
        )}

        {last && <Doc workflow={last.workflow} doc={last.doc} when={last.createdAt} />}
      </div>
    </>
  );
}
