import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { aiConfigured } from "@/lib/ai";
import { getLatestScoutReport, type ScoutPick, type ScoutReport } from "@/lib/article-scout";
import { RunScout } from "@/components/hub/scout/RunScout";

export const metadata = { title: "Article scout — Winning in the Age of AI" };

const KIND_LABEL: Record<string, string> = {
  hype: "Hype", fearmongering: "Fearmongering", disagrees: "Disagrees with us",
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  const parsed = new Date(`${d}T00:00:00`);
  return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Group picks by lane, lanes ordered by their strongest pick; General last. */
function byLane(picks: ScoutPick[]): { lane: string; picks: ScoutPick[] }[] {
  const map = new Map<string, ScoutPick[]>();
  for (const p of picks) (map.get(p.lane) ?? map.set(p.lane, []).get(p.lane)!).push(p);
  return [...map.entries()]
    .map(([lane, ps]) => ({ lane, picks: ps, top: Math.max(...ps.map((p) => p.impact)) }))
    .sort((a, b) => (a.lane === "General" ? 1 : b.lane === "General" ? -1 : b.top - a.top))
    .map(({ lane, picks }) => ({ lane, picks }));
}

function PickCard({ p, lead }: { p: ScoutPick; lead?: boolean }) {
  return (
    <div className={"scout-pick" + (lead ? " lead" : "")}>
      <div className="scout-pick-top">
        <span className="scout-area">{p.learnArea}</span>
        <span className="scout-impact" title="Impact">{"●".repeat(p.impact)}<span className="dim">{"●".repeat(5 - p.impact)}</span></span>
      </div>
      <a href={p.url} target="_blank" rel="noopener noreferrer" className="scout-title">{p.title} ↗</a>
      <p className="scout-src">{p.source}{p.date ? ` · ${fmtDate(p.date)}` : ""}</p>
      {p.summary && <p className="scout-sum">{p.summary}</p>}
      {p.pullQuote && <blockquote className="scout-quote">“{p.pullQuote}”</blockquote>}
      {p.thesisLink && <p className="scout-thesis"><span className="k">Our angle</span> {p.thesisLink}</p>}
      <Link href={`/hub/health?feature=${encodeURIComponent(p.id)}`} className="scout-use">Use in this week&apos;s brief →</Link>
    </div>
  );
}

export default async function ScoutPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();

  const report: ScoutReport | null = await getLatestScoutReport();
  const aiOn = aiConfigured();

  return (
    <>
      <div className="hub-top">
        <h1>Article scout</h1>
        <span className="sp" />
        <span className="hub-pill">Founder view</span>
      </div>
      <div className="hub-body">
        <p className="scout-intro">
          A weekly hunt for the most relevant real articles across our Learn areas and career lanes — tagged,
          summarised, and linked to our thesis, with one counterpoint to keep us honest. Runs every Saturday;
          use it to write Sunday&apos;s newsletter.
        </p>

        {aiOn ? <RunScout hasReport={!!report} /> : (
          <p className="feed-empty">Set <code>ANTHROPIC_API_KEY</code> to enable the scout.</p>
        )}

        {!report ? (
          aiOn && <p className="feed-empty" style={{ marginTop: 18 }}>No report yet. Run the scout to build your first briefing.</p>
        ) : (
          <>
            <div className="scout-head">
              <span className="scout-week">{report.weekOf}</span>
              {report.generatedAt && (
                <span className="scout-gen">Generated {new Date(report.generatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
            {report.overview && <p className="scout-overview">{report.overview}</p>}

            {report.picks.filter((p) => p.id === report.leadId).map((p) => (
              <div key={p.id}>
                <div className="hub-sectlabel">Lead story</div>
                <PickCard p={p} lead />
              </div>
            ))}

            {byLane(report.picks.filter((p) => p.id !== report.leadId)).map(({ lane, picks }) => (
              <div key={lane}>
                <div className="hub-sectlabel">{lane}</div>
                <div className="scout-grid">
                  {picks.map((p) => <PickCard key={p.id} p={p} />)}
                </div>
              </div>
            ))}

            {report.counterpoint && (
              <>
                <div className="hub-sectlabel">The counterpoint · one to argue with</div>
                <div className="scout-counter">
                  <span className="scout-counter-tag">{KIND_LABEL[report.counterpoint.kind] ?? "Counterpoint"}</span>
                  <a href={report.counterpoint.url} target="_blank" rel="noopener noreferrer" className="scout-title">{report.counterpoint.title} ↗</a>
                  <p className="scout-src">{report.counterpoint.source}{report.counterpoint.date ? ` · ${fmtDate(report.counterpoint.date)}` : ""}</p>
                  {report.counterpoint.summary && <p className="scout-sum">{report.counterpoint.summary}</p>}
                  {report.counterpoint.why && <p className="scout-thesis"><span className="k">Their case</span> {report.counterpoint.why}</p>}
                  {report.counterpoint.ourAngle && <p className="scout-thesis"><span className="k pen">How we answer</span> {report.counterpoint.ourAngle}</p>}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
