import { MarkStarted } from "@/components/hub/MarkStarted";

export const metadata = { title: "Learn — Pivotum" };

const EXPOSING = [
  { icon: "⚙️", name: "Automatability", short: "How much of the work AI can already do",
    body: "The screen-and-language tasks AI handles well today. The more of your day is routine, high-volume, pattern-following work, the more exposed you are — and the faster it moves." },
  { icon: "🪜", name: "Entry-erosion", short: "The junior rungs automate first",
    body: "AI hits entry-level tasks first, and the ladder above compresses as one person plus AI does the work of a team. If your value is built from junior, repeatable rungs, the climb gets steeper." },
];

const PROTECTING = [
  { icon: "🤝", name: "Trust", short: "The relationships others rely on by name",
    body: "Work where people come to you — where the relationship, not the output, is the product. AI can draft, but it can't be the person a client trusts with the call." },
  { icon: "⚖️", name: "Judgment", short: "High-stakes, ambiguous calls",
    body: "Decisions where being right really matters and the answer isn't in the data. You own the outcome — and in the age of AI, owning the call is the job." },
  { icon: "🩺", name: "Physical", short: "Hands-on, in-person work",
    body: "Work that happens in the room, with your hands, in the world. The further your value sits from a screen, the harder it is for AI to reach." },
  { icon: "📜", name: "Licensing", short: "Credentials that gate the work",
    body: "Where the law or a body says only a credentialed human may do it. The hardest moat to cross — and the slowest to erode." },
];

const FOUNDATIONS = [
  { icon: "◆", name: "Embrace", short: "Face the change — go AI-native",
    body: "Winning starts with a decision: stop resisting the shift and move toward it. Bring AI into your actual work, do the reps, and share what you learn. The people who thrive aren't the ones who avoid AI — they're the ones who make it their instrument. Everything in Build is how you Embrace." },
  { icon: "✦", name: "Together", short: "You win faster as part of a group",
    body: "No one navigates a shift this big alone. Being seen, held to your commitments, and learning from people on the same path is what turns intention into motion. Your pod, the feed, the events — that's Together. Be generous, be kind, and use the room." },
];

function LeverCard({ l }: { l: { icon: string; name: string; short: string; body: string } }) {
  return (
    <div className="card lever-card">
      <p className="ck">{l.icon} {l.name}</p>
      <h3>{l.short}</h3>
      <p>{l.body}</p>
    </div>
  );
}

export default function LearnPage() {
  return (
    <>
      <MarkStarted />
      <div className="hub-top"><h1>Learn</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Winning in the age of AI rests on two foundations — <b>Embrace</b> and <b>Together</b> — and turns on
          six levers: two that <b>expose</b> you as AI improves, four that <b>protect</b> you where it can&apos;t reach.
          Learn these, and your Map stops being a verdict and becomes a set of dials you can turn.
        </p>

        <div className="hub-sectlabel">The two foundations</div>
        <div className="hub-grid">{FOUNDATIONS.map((l) => <LeverCard key={l.name} l={l} />)}</div>

        <div className="hub-sectlabel">What exposes you</div>
        <div className="hub-grid">{EXPOSING.map((l) => <LeverCard key={l.name} l={l} />)}</div>

        <div className="hub-sectlabel">What protects you</div>
        <div className="hub-grid">{PROTECTING.map((l) => <LeverCard key={l.name} l={l} />)}</div>

        <div className="hub-sectlabel">Put it to work</div>
        <div className="hub-grid">
          <a className="card" href="/hub/map"><p className="ck">🧭 Map</p><h3>See your own levers</h3><p>Your Map scores each of these for your exact lane — and names the one to pull first.</p></a>
          <a className="card" href="/hub/build"><p className="ck">🛠 Build</p><h3>Train the two edges</h3><p>Master the machine on the exposing levers; deepen what AI can&apos;t take on the protecting ones.</p></a>
        </div>
      </div>
    </>
  );
}
