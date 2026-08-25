import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getHealthReport, type MemberHealth } from "@/lib/health";
import { getCurrentPrompt } from "@/lib/ritual";
import { getHighlights } from "@/lib/highlights";
import { startDM } from "@/app/hub/messages/actions";
import { Avatar } from "@/components/hub/community/Avatar";
import { PromptSetter } from "@/components/hub/health/PromptSetter";
import { HighlightManager } from "@/components/hub/health/HighlightManager";
import { aiConfigured } from "@/lib/ai";

export const metadata = { title: "Member health — Winning in the Age of AI" };

const FLAG_CLS: Record<string, string> = {
  "Never mapped": "f-red", "Re-score overdue": "f-amber", "Dormant": "f-red",
  "At risk": "f-amber", "No pod": "f-grey", "No moves": "f-grey",
};

function seenLabel(d: number | null): string {
  if (d == null) return "never seen";
  if (d === 0) return "seen today";
  if (d === 1) return "seen yesterday";
  return `seen ${d}d ago`;
}

function AttentionRow({ m }: { m: MemberHealth }) {
  const facts = [
    m.lane || m.careerStage,
    m.mapped ? `${m.editions} map${m.editions === 1 ? "" : "s"}` : "no map",
    `${m.pods} pod${m.pods === 1 ? "" : "s"}`,
    m.movesActive || m.movesDone ? `${m.movesActive}▸ ${m.movesDone}✓ moves` : "no moves",
  ].filter(Boolean).join(" · ");
  return (
    <div className={"mh-row s-" + m.status}>
      <Avatar name={m.name} url={m.avatarUrl} size={40} />
      <div className="mh-main">
        <div className="mh-top">
          <Link href={`/hub/members/${m.handle ?? m.id}`} className="mh-name">{m.name}</Link>
          <span className="mh-seen">{seenLabel(m.daysSinceSeen)}</span>
        </div>
        <p className="mh-facts">{facts}</p>
        <div className="mh-flags">
          {m.flags.map((f) => <span key={f} className={"mh-flag " + (FLAG_CLS[f] ?? "f-grey")}>{f}</span>)}
        </div>
      </div>
      <form action={startDM.bind(null, m.id)} className="mh-act">
        <button type="submit" title={`Message ${m.name}`}>✉ Reach out</button>
      </form>
    </div>
  );
}

export default async function HealthPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();
  const [r, prompt, highlights] = await Promise.all([getHealthReport(), getCurrentPrompt(), getHighlights()]);

  const kpis: { label: string; value: number; cls?: string }[] = [
    { label: "Members", value: r.summary.total },
    { label: "Active · 7d", value: r.summary.active, cls: "k-good" },
    { label: "At risk", value: r.summary.atRisk, cls: "k-warn" },
    { label: "Dormant", value: r.summary.dormant, cls: "k-bad" },
    { label: "Re-score overdue", value: r.summary.overdueRescore, cls: "k-warn" },
    { label: "Never mapped", value: r.summary.neverMapped, cls: "k-bad" },
    { label: "No pod", value: r.summary.noPod, cls: "k-warn" },
  ];

  return (
    <>
      <div className="hub-top"><h1>Member health</h1><span className="sp" /><span className="hub-pill">Founder view</span></div>
      <div className="hub-body">
        <div className="hub-sectlabel">This week&apos;s prompt · the community heartbeat</div>
        <PromptSetter current={prompt ? { title: prompt.title, body: prompt.body } : null} aiOn={aiConfigured()} />

        <div className="hub-sectlabel">Looking-glass highlights · what non-members see</div>
        <HighlightManager highlights={highlights} />

        <div className="mh-kpis">
          {kpis.map((k) => (
            <div key={k.label} className={"mh-kpi " + (k.cls ?? "")}>
              <div className="mh-kpi-num">{k.value}</div>
              <div className="mh-kpi-lbl">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="hub-sectlabel">Needs attention</div>
        {r.attention.length === 0 ? (
          <p className="feed-empty">Everyone&apos;s active, mapped, and in a pod. Nothing to chase. 🎉</p>
        ) : (
          <div className="mh-list">{r.attention.map((m) => <AttentionRow key={m.id} m={m} />)}</div>
        )}

        <div className="mh-cols">
          <div>
            <div className="hub-sectlabel">Pods</div>
            <div className="mh-pods">
              {r.pods.length === 0 ? <p className="feed-empty">No pods yet.</p> : r.pods.map((p) => (
                <Link key={p.id} href={`/hub/pods/${p.slug}`} className={"mh-pod" + (p.dead ? " dead" : "")}>
                  <div className="mh-pod-main">
                    <b>{p.name}</b>
                    <span>{p.members} member{p.members === 1 ? "" : "s"} · {p.posts30} post{p.posts30 === 1 ? "" : "s"}/30d</span>
                  </div>
                  {p.dead ? <span className="mh-pod-tag bad">Quiet</span> : <span className="mh-pod-tag ok">Active</span>}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="hub-sectlabel">What&apos;s landing · 30 days</div>
            <div className="mh-landing">
              {r.landing.length === 0 ? <p className="feed-empty">Not enough activity yet.</p> : r.landing.map((p) => (
                <Link key={p.id} href={p.href} className="mh-land">
                  <p className="mh-land-body">{p.snippet}{p.snippet.length >= 120 ? "…" : ""}</p>
                  <div className="mh-land-meta">
                    <span>{p.author} · {p.podName}</span>
                    <span className="mh-land-eng">❤ {p.reactions} · 💬 {p.comments}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
