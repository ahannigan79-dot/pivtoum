import { LADDER, MOVES, type Rebuild } from "@/lib/rebuild";
import { LogRep } from "@/components/hub/LogRep";

const EDGE_LABEL = { master: "◆ Master", deepen: "✦ Deepen", both: "◆✦ Master + Deepen" };

export function WorkflowRebuild({ rebuild, done }: { rebuild: Rebuild; done: boolean }) {
  return (
    <div className="rb">
      <div className="rb-head">
        <p className="ck">Workflow Rebuild · {rebuild.field}</p>
        <h2>{rebuild.workflow}</h2>
        <p className="rb-thesis">{rebuild.thesis}</p>
      </div>

      <div className="rb-cols">
        <div className="rb-col">
          <span className="rb-kk">The workflow today</span>
          <ol className="rb-flow">
            {rebuild.steps.map((s, i) => (
              <li key={i}><span className="rb-sn">{i + 1}</span><div><p className="rb-fl">{s.label}</p><p className="rb-ft">{s.today}</p></div></li>
            ))}
          </ol>
        </div>
        <div className="rb-col">
          <span className="rb-kk">Rebuilt AI-native</span>
          <ol className="rb-flow native">
            {rebuild.steps.map((s, i) => (
              <li key={i}><span className="rb-sn">{i + 1}</span><div>
                <p className="rb-fl">{s.label} <span className="rb-own">You: {s.own}</span></p>
                <p className="rb-ft"><span className="rb-ai">AI</span> {s.ai}; <span className="rb-you">you</span> {s.you}</p>
              </div></li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rb-delta">
        <span className="rb-kk">What actually changed</span>
        <div className="rb-stats">
          {rebuild.delta.map((d, i) => <div key={i} className="rb-stat"><div className="v">{d.v}</div><div className="l">{d.l}</div></div>)}
        </div>
        <p className="rb-pull">{rebuild.pull}</p>
      </div>

      <div className="rb-ladder">
        <span className="rb-kk">The impact runs up the ladder</span>
        <p className="rb-ladnote">AI doesn&apos;t hit a career evenly. It eats the <b>execution rungs first</b> — junior and mid — and rewards the two ends: the newcomer who arrives <b>AI-native</b>, and the senior who owns the <b>judgment</b>. Where you stand decides your move.</p>
        {LADDER.map((r) => (
          <div key={r.who} className={"rb-rung t-" + r.tone}>
            <div className="rb-rung-top"><span className="rb-who">{r.who}</span><span className={"rb-risk t-" + r.tone}>{r.risk}</span></div>
            <p className="rb-what">{r.what}</p>
            <p className="rb-move"><b>Your move</b> {r.move}</p>
          </div>
        ))}
      </div>

      <div className="rb-moves">
        <span className="rb-kk">Five moves that build you up</span>
        <p className="rb-movesintro">Seeing the change isn&apos;t the point — <b>becoming the one who drives it is.</b> Each of these is also a <b>deep-dive week</b> in the community.</p>
        {MOVES.map((m) => (
          <div key={m.n} className={"rb-movecard" + (m.keystone ? " key" : "")}>
            {m.keystone && <div className="rb-keymark">★ The keystone move</div>}
            <div className="rb-mh"><span className="rb-mi">{m.n}</span><h3>{m.title}</h3><span className={"rb-etag e-" + m.edge}>{EDGE_LABEL[m.edge]}</span></div>
            <p className="rb-do">{m.do}</p>
            <p className="rb-sit"><b>Sit with</b> {m.sit}</p>
            <p className="rb-week">{m.week}</p>
          </div>
        ))}
      </div>

      <div className="rb-foot">
        <div><b>{rebuild.career}</b> — one of the rebuilds. Your Map points to which edge to push first; your Build Clinic is where you run it.</div>
        <LogRep repKey={`rebuild:${rebuild.slug}`} done={done} />
      </div>
    </div>
  );
}
