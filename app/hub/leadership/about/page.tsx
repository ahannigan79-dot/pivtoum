import Link from "next/link";

export const metadata = { title: "Leading a pod or a domain — Pivotum" };

// The role explainer — what captains and domain leaders actually do, and why it
// matters. Deliberately about the responsibility and the impact, never a perk.
export default function LeadAboutPage() {
  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/welcome" className="back">‹ Back</Link>
        <span className="tt">Leading in the community</span>
      </div>
      <div className="hub-body" style={{ maxWidth: 680 }}>
        <div className="lead-article">
          <p className="ck">Two ways to lead</p>
          <h1>Nobody wins this alone — and the community only works because members step up to lead it.</h1>
          <p className="lead-lede">
            Leading here isn&rsquo;t a title. It&rsquo;s taking responsibility for other people&rsquo;s momentum through
            the biggest shift of our careers. If that pulls at you, here&rsquo;s what it means.
          </p>

          <h2>Pod captain</h2>
          <p>
            A captain runs one pod — your team of a handful of people in your lane. You&rsquo;re the person who keeps
            the pod in motion: you set the pod&rsquo;s vibe, post the weekly move, make sure everyone drops their
            check-in, and welcome new members in so nobody sits on the edge. When someone goes quiet, you notice.
            When the pod wins, you name it.
          </p>
          <p>
            It&rsquo;s a real commitment — an hour or two a week — and it rotates, so captaincy passes around the pod
            over time. Most members get a turn. You don&rsquo;t need to be the most advanced person in the room; you
            need to care that the room keeps moving.
          </p>

          <h2>Domain leader</h2>
          <p>
            A domain leader stewards every pod in a domain — say, all the finance pods, or all the marketing ones.
            You&rsquo;re the connective tissue above the captains: you keep an eye on the health of the pods in your
            domain, support and coach the captains, spin up new pods as lanes fill, and run the occasional
            domain-wide session or league. It&rsquo;s a standing role you apply for and Adam confirms — a real say in
            how your corner of the community grows.
          </p>

          <h2>Why it&rsquo;s worth it</h2>
          <p>
            Our two tenets are <b>Together</b> and <b>Embrace the opportunity</b>. Leading is where both come alive:
            you turn a group of individuals into a team, and you get the sharpest possible seat on the change —
            because teaching and steering others through it is how you master it yourself. The people who lead here
            come out of this transition further ahead, with a network and a reputation that compounds.
          </p>

          <p className="lead-back">
            Interested? <Link href="/hub/welcome">Register your interest from your setup</Link> — it&rsquo;s a
            conversation, not a commitment, and there&rsquo;s no pressure either way.
          </p>
        </div>
      </div>
    </>
  );
}
