import type { MemberSignals } from "@/lib/signals";
import { SignalWhy } from "@/components/hub/dashboard/SignalWhy";

/** "This week in AI" — a few curated articles, the member's field first, then
 *  broad AI news. Read-only; links open the source. Fed by the weekly scout. */
export function Signals({ data }: { data: MemberSignals }) {
  if (!data) return null;
  return (
    <section className="card sig">
      <div className="sig-head">
        <p className="ck">This week in AI{data.fieldLabel ? ` · ${data.fieldLabel}` : ""}</p>
        <span className="sig-wk">Curated · week of {data.weekOf}</span>
      </div>
      <ul className="sig-list">
        {data.items.map((s, i) => (
          <li key={s.id} className="sig-item">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="sig-link">
              <span className="sig-row">
                <span className={"sig-tag " + (s.field ? "f" : "g")}>{s.field ? "Your field" : "AI at large"}</span>
                <span className="sig-src">{s.source}</span>
              </span>
              <span className="sig-title">{s.title}</span>
              <span className="sig-sum">{s.summary}</span>
            </a>
            {i === 0 && <SignalWhy />}
          </li>
        ))}
      </ul>
      <p className="sig-foot">Scanned from the week&rsquo;s real reporting — tap any piece to read the source.</p>
    </section>
  );
}
