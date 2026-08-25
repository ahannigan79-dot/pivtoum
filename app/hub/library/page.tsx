import Link from "next/link";

export const metadata = { title: "Library — Winning in the Age of AI" };

type Item = { icon: string; title: string; body: string; href?: string; tag?: string; external?: boolean };
type Section = { label: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    label: "Start here",
    items: [
      { icon: "📦", title: "The Welcome Pack", body: "How this community works, the Winning Loop, and how to win here. Read this first.", href: "/hub/library/welcome-pack" },
      { icon: "🗺", title: "Your step-by-step Welcome", body: "The ten-step on-ramp: build your Map, book your session, join your pod, get moving.", href: "/hub/welcome" },
    ],
  },
  {
    label: "The framework — Learn",
    items: [
      { icon: "◆✦", title: "Embrace & Together", body: "The two foundations everything stands on — the stance that wins, and why nobody wins alone.", href: "/hub/learn/embrace" },
      { icon: "📚", title: "The six levers", body: "The forces that decide who's exposed and who's protected. The full ten-lesson curriculum.", href: "/hub/learn" },
      { icon: "📐", title: "The methodology", body: "How we score every career and lane — the model behind your Map.", href: "/methodology", external: true },
    ],
  },
  {
    label: "Your tools — Map & Build",
    items: [
      { icon: "🧭", title: "Your AI Career Map", body: "Where you stand — exposure, levers, and your winning move.", href: "/hub/map" },
      { icon: "🎯", title: "The Operator", body: "The judgment in the age of AI — and the seven-step Operator Track that trains it.", href: "/hub/build/operator" },
      { icon: "🥊", title: "The Judgment Gym", body: "Judge AI's work at speed and get scored. Fresh reps rotate in every lane.", href: "/hub/build/gym" },
      { icon: "🔧", title: "Workflow Rebuild", body: "Watch your job rebuilt AI-native — a library of workflows across careers and lanes.", href: "/hub/build/rebuild" },
      { icon: "🛡", title: "Protected Ground", body: "Where the protected ground is, and whether your moat is holding.", href: "/hub/build/protected-ground" },
    ],
  },
  {
    label: "Field signals · reading the shifts",
    items: [
      { icon: "📰", title: "Essays & analysis", body: "How AI is reshaping the world of work — read to stay ahead of the shifts.", href: "/articles", external: true },
      { icon: "💬", title: "This week in the community", body: "The weekly prompt and what the community's working on — the live pulse.", href: "/hub/community" },
    ],
  },
];

function Card({ it }: { it: Item }) {
  const inner = (
    <>
      <h3 className="lib-title"><span className="lib-ic">{it.icon}</span> {it.title}</h3>
      <p>{it.body}</p>
      {it.tag ? <span className="lib-tag">{it.tag}</span> : <span className="lib-go">Open →</span>}
    </>
  );
  if (!it.href) return <div className="card lib-card">{inner}</div>;
  return <Link href={it.href} className="card lib-card" {...(it.external ? { target: "_self" } : {})}>{inner}</Link>;
}

export default function LibraryPage() {
  return (
    <>
      <div className="hub-top"><h1>Library</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Everything in one place — the Welcome pack, the framework, your tools, and the field signals worth reading.
          The backbone of <b>Winning in the Age of AI</b>.
        </p>
        {SECTIONS.map((s) => (
          <div key={s.label}>
            <div className="hub-sectlabel">{s.label}</div>
            <div className="hub-grid">
              {s.items.map((it) => <Card key={it.title} it={it} />)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
