import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { OPERATOR } from "@/lib/operator";
import { getBuildReps } from "@/lib/build";
import { LogRep } from "@/components/hub/LogRep";

export const metadata = { title: "The Operator — Pivotum" };

export default async function OperatorPage() {
  const { userId } = await auth();
  const done = (await getBuildReps(userId)).has("operator");

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">The Operator</span></div>
      <div className="hub-body op">
        <div className="op-head">
          <p className="ck">Build · the human end-state</p>
          <h2>Becoming the Operator</h2>
          <p className="op-thesis">{OPERATOR.thesis}</p>
        </div>

        <section className="op-sect">
          <span className="op-kk">What it is</span>
          <h3>The operator directs — and carries the call</h3>
          <div className="op-def"><b>Judgment, defined</b><p>{OPERATOR.judgmentDef}</p></div>
          <div className="op-stack">
            {OPERATOR.stack.map((s) => (
              <div key={s.n} className="op-stackitem">
                <span className="op-n">{s.n}</span>
                <div><p className="op-verb">{s.verb}</p><p className="op-do">{s.do}</p><p className="op-jd"><b>The judgment</b> {s.judgment}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="op-sect">
          <span className="op-kk">A new kind of judgment</span>
          <h3>Not the judgment you trained before</h3>
          <p className="op-lead">Judging AI's work is not the same skill as the judgment you've built over a career — it has traps the old judgment never had. That's why it has to be trained on its own.</p>
          <div className="op-traps">
            {OPERATOR.traps.map((t) => (
              <div key={t.tag} className="op-trap">
                <span className="op-trap-tag">{t.tag}</span>
                <p className="op-trap-title">{t.title}</p>
                <p className="op-trap-body">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="op-sect">
          <span className="op-kk">Why it's different</span>
          <h3>It's not your old job with better tools</h3>
          <div className="op-contrast">
            <div className="op-crow op-chead"><span>The executor — before</span><span>The operator — now</span></div>
            {OPERATOR.contrast.map((c, i) => (
              <div key={i} className="op-crow"><span>{c.before}</span><span className="aft">{c.after}</span></div>
            ))}
          </div>
        </section>

        <section className="op-sect">
          <span className="op-kk">How you train — the Operator Track</span>
          <h3>Seven ways to build judgment on purpose</h3>
          <p className="op-lead">These are the deliberate practices that grow it — the last is the muscle AI makes essential. Each is a deep-dive week in the community.</p>
          <div className="op-track">
            {OPERATOR.track.map((m) => (
              <div key={m.n} className={"op-move" + (m.ai ? " ai" : "")}>
                <div className="op-mh"><span className="op-mi">{m.n}</span><h4>{m.title}</h4>{m.ai && <span className="op-aitag">The AI muscle</span>}</div>
                <p className="op-mdo">{m.do}</p>
                <p className="op-sit"><b>Sit with</b> {m.sit}</p>
                <p className="op-week">Deep-dive week · {m.week}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="op-foot">
          <div>The operator is who every rebuild points you toward. Your Map names the edge; the Gym and the Clinics are where you train it.</div>
          <LogRep repKey="operator" done={done} />
        </div>
      </div>
    </>
  );
}
