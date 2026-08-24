import Link from "next/link";

export const metadata = { title: "Library — Winning in the Age of AI" };

type Item = { icon: string; title: string; body: string; href?: string; tag?: string; external?: boolean };
type Section = { label: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    label: "Start here",
    items: [
      { icon: "📦", title: "The Welcome Pack", body: "How this community works, the Winning Loop, and how to win here. Read this first.", tag: "Coming soon" },
      { icon: "🧭", title: "How the Winning Loop works", body: "Embrace + Together, then Learn → Map → Build → Evolve. Your on-ramp, step by step.", href: "/hub/welcome" },
    ],
  },
  {
    label: "The framework",
    items: [
      { icon: "📚", title: "The six levers", body: "The forces that decide who's exposed and who's protected in the age of AI.", href: "/hub/learn" },
      { icon: "📐", title: "The methodology", body: "How we score every career and lane — the model behind your Map.", href: "/methodology", external: true },
    ],
  },
  {
    label: "Your tools",
    items: [
      { icon: "🧭", title: "Your AI Career Map", body: "Where you stand — exposure, levers, and your winning move.", href: "/hub/map" },
      { icon: "🛠", title: "The Build tools", body: "The Operator, the Judgment Gym, Workflow Rebuilds, and Protected Ground.", href: "/hub/build" },
    ],
  },
  {
    label: "Field signals · reading the shifts",
    items: [
      { icon: "📰", title: "Essays & analysis", body: "How AI is reshaping the world of work — read to stay ahead of the shifts.", href: "/articles", external: true },
      { icon: "🗞", title: "The weekly newsletter", body: "A short weekly read on what moved in AI and what it means for your work.", tag: "Coming soon" },
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
