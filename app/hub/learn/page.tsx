import Link from "next/link";
import { MarkStarted } from "@/components/hub/MarkStarted";

export const metadata = { title: "Learn — Winning in the Age of AI" };

const FOUNDATIONS = [
  { icon: "◆", name: "Embrace", short: "Face the change — go AI-native",
    body: "Stop resisting the shift and move toward it. Bring AI into your actual work, do the reps, share what you learn. The people who thrive make AI their instrument. Build is how you Embrace." },
  { icon: "✦", name: "Together", short: "You win faster as a group",
    body: "No one navigates a shift this big alone. Being seen, held to your commitments, and learning from people on the same path turns intention into motion. Your pod, the feed, the events — that's Together." },
];

const EXPOSING = [
  { icon: "⚙️", name: "Automatability", short: "How much AI can already do", body: "The screen-and-language work AI handles well today. The more of your day is routine and pattern-following, the more exposed — and the faster it moves." },
  { icon: "🪜", name: "Entry-erosion", short: "The junior rungs go first", body: "AI hits entry-level tasks first, and the ladder compresses as one person plus AI does the work of a team. Value built from junior rungs gets a steeper climb." },
];

const PROTECTING = [
  { icon: "🤝", name: "Trust", short: "Relied on by name", body: "Work where the relationship is the product. AI can draft, but it can't be the person a client trusts with the call." },
  { icon: "⚖️", name: "Judgment", short: "High-stakes, ambiguous calls", body: "Decisions where being right really matters and the answer isn't in the data. Owning the call is the job." },
  { icon: "🩺", name: "Physical", short: "Hands-on, in person", body: "Work that happens in the room, with your hands. The further from a screen, the harder for AI to reach." },
  { icon: "📜", name: "Licensing", short: "Credentials that gate the work", body: "Where the law says only a credentialed human may do it. The hardest moat to cross, slowest to erode." },
];

type L = { icon: string; name: string; short: string; body: string };
function LeverTile({ l, kind }: { l: L; kind: "expose" | "protect" | "found" }) {
  return (
    <div className={`lever-tile k-${kind}`}>
      <span className="lv-ic">{l.icon}</span>
      <h3>{l.name}</h3>
      <p className="lv-short">{l.short}</p>
      <p className="lv-body">{l.body}</p>
    </div>
  );
}

export default function LearnPage() {
  return (
    <>
      <MarkStarted />
      <div className="hub-top"><h1>Learn</h1><span className="sp" /></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">The rules of the game</p>
          <h2>Your score isn&apos;t luck — it&apos;s a system you can play.</h2>
          <p>Two <b>foundations</b> set your stance. Six <b>levers</b> decide your exposure: two that expose you as AI improves, four that protect you where it can&apos;t reach. Learn these, and your Map becomes a set of dials — not a verdict.</p>
        </div>

        <div className="hub-sectlabel">The two foundations</div>
        <div className="lever-grid">{FOUNDATIONS.map((l) => <LeverTile key={l.name} l={l} kind="found" />)}</div>

        <div className="hub-sectlabel">⚠ What exposes you</div>
        <div className="lever-grid">{EXPOSING.map((l) => <LeverTile key={l.name} l={l} kind="expose" />)}</div>

        <div className="hub-sectlabel">🛡 What protects you</div>
        <div className="lever-grid">{PROTECTING.map((l) => <LeverTile key={l.name} l={l} kind="protect" />)}</div>

        <div className="hub-sectlabel">Put it to work</div>
        <div className="build-grid">
          <Link href="/hub/map" className="build-tile a-green"><span className="bt-ic">🧭</span><div className="bt-body"><span className="bt-kicker">Your Map</span><h3>See your own levers</h3><p>Your Map scores each of these for your exact lane — and names the one to pull first.</p><span className="bt-cta">Open your Map →</span></div></Link>
          <Link href="/hub/build" className="build-tile a-green"><span className="bt-ic">🛠</span><div className="bt-body"><span className="bt-kicker">Build</span><h3>Train the two edges</h3><p>Master the machine on the exposing levers; deepen what AI can&apos;t take on the protecting ones.</p><span className="bt-cta">Go to Build →</span></div></Link>
        </div>
      </div>
    </>
  );
}
