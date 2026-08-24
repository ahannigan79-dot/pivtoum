import Link from "next/link";

export const metadata = { title: "Build — Winning in the Age of AI" };

type Tile = { href: string; icon: string; kicker: string; title: string; body: string; cta: string; accent: string };

const RENOVATE: Tile[] = [
  { href: "/hub/build/rebuild", icon: "🔧", kicker: "Workflow Rebuild", title: "Rebuild your job, AI-native", accent: "green",
    body: "Watch a core workflow in your field done today vs. rebuilt with AI — and the five moves that turn it into your own climb.", cta: "Rebuild it" },
  { href: "/hub/build/operator", icon: "🎯", kicker: "The Operator", title: "Become the operator", accent: "green",
    body: "What judgment in the age of AI really is, why it's different, and the Operator Track that trains it.", cta: "Train judgment" },
  { href: "/hub/build/gym", icon: "🥊", kicker: "Judgment Gym", title: "Spot what AI got wrong", accent: "amber",
    body: "The AI hands you polished work — some of it subtly wrong. Judge it at speed, get scored, return weekly.", cta: "Start a rep" },
];

const PROTECT: Tile[] = [
  { href: "/hub/build/protected-ground", icon: "🛡", kicker: "Protected Ground", title: "Find your protected ground", accent: "pen",
    body: "Understand what protects you, shift to a safer lane in your field, or watch whether your moat is holding.", cta: "Explore ground" },
];

function BuildTile({ t }: { t: Tile }) {
  return (
    <Link href={t.href} className={`build-tile a-${t.accent}`}>
      <span className="bt-ic">{t.icon}</span>
      <div className="bt-body">
        <span className="bt-kicker">{t.kicker}</span>
        <h3>{t.title}</h3>
        <p>{t.body}</p>
        <span className="bt-cta">{t.cta} →</span>
      </div>
    </Link>
  );
}

export default function BuildPage() {
  return (
    <>
      <div className="hub-top"><h1>Build</h1><span className="sp" /></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">Do the work</p>
          <h2>This is where you put in the reps.</h2>
          <p>Your Map says where you stand and prescribes your mix. Build is the gym: <b>renovate</b> — master the machine and sharpen your judgment — and, where you need it, <b>relocate</b> to protected ground. Every rep here moves your trajectory.</p>
        </div>

        <div className="hub-sectlabel">◆ Renovate — master the machine</div>
        <div className="build-grid">{RENOVATE.map((t) => <BuildTile key={t.href} t={t} />)}</div>

        <div className="hub-sectlabel">✦ Relocate or guard — protected ground</div>
        <div className="build-grid">{PROTECT.map((t) => <BuildTile key={t.href} t={t} />)}</div>
      </div>
    </>
  );
}
