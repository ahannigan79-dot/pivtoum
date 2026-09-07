import type { Transformation } from "@/lib/workflow-transform";

/** Pure, read-only render of a transformation doc. Shared by the owner's page
 *  and the public share page so the artifact looks identical everywhere. */
export function TransformDocView({ title, doc, when }: { title: string; doc: Transformation; when: Date }) {
  const date = new Date(when).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <article className="wtdoc">
      <header className="wt-head">
        <p className="ck">Workflow transformation</p>
        <h2>{doc.title || title}</h2>
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
