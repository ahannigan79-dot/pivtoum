import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";

export const metadata = { title: "The Welcome Pack — Winning in the Age of AI" };

export default async function WelcomePackPage() {
  await auth();
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/library" className="back">‹ Library</Link><span className="tt">The Welcome Pack</span></div>
      <div className="hub-body pack">
        <div className="pack-head">
          <p className="ck">Start here · read this first</p>
          <h2>Welcome to Winning in the Age of AI</h2>
          <p className="pack-lede">
            Glad you&apos;re here, {first}. This is the one thing to read before anything else — what this
            community is, how it works, and how you actually win here. Ten minutes now saves you a lot of
            wandering later.
          </p>
        </div>

        <section className="pack-sect">
          <span className="pack-kk">What this is</span>
          <h3>A working community, not a course</h3>
          <p>AI is remaking the world of work, and most people are either freezing or doom-scrolling about it. This is the room for the other response: face it honestly, figure out where you actually stand, and do the work to come out ahead — together, and out loud. You won&apos;t find passive videos here. You&apos;ll find a plan that&apos;s yours, people in your exact lane, and reps that move your position.</p>
        </section>

        <section className="pack-sect">
          <span className="pack-kk">The two foundations</span>
          <h3>Embrace, and Together</h3>
          <div className="pack-two">
            <div className="pack-found">
              <b>Embrace</b>
              <p>Run toward the change, not away from it. Bring AI into your actual work, do the reps, learn its limits by using it. The people who win make the machine their instrument — you stop competing with it and become the one who wields it best.</p>
            </div>
            <div className="pack-found">
              <b>Together</b>
              <p>Nobody navigates a shift this big alone. Being seen, held to your word, and learning from people on the same climb is what turns intention into motion. Your pod, the feed, the events — that&apos;s Together, and it&apos;s the engine.</p>
            </div>
          </div>
        </section>

        <section className="pack-sect">
          <span className="pack-kk">How the community works</span>
          <h3>The Winning Loop</h3>
          <p className="pack-lead">Everything here runs on one loop. You come back around as the field shifts and as you put in the work.</p>
          <ol className="pack-loop">
            <li><b>Learn</b> — the rules of the game: the stance that wins, and the six levers that set your exposure. <Link href="/hub/learn">Open Learn →</Link></li>
            <li><b>Map</b> — where you stand: your exposure, your winning strategy, and the moves that lower it. Your Map is the spine everything hangs off. <Link href="/hub/map">Build your Map →</Link></li>
            <li><b>Build</b> — the reps: master the machine on what it&apos;s taking, and deepen the judgment it can&apos;t. The Gym and the Workflow Rebuilds live here. <Link href="/hub/build">Go to Build →</Link></li>
            <li><b>Evolve</b> — bring it together: ship your moves, re-score, and watch your exposure come down. <Link href="/hub">Open Evolve →</Link></li>
          </ol>
        </section>

        <section className="pack-sect">
          <span className="pack-kk">How you actually win here</span>
          <h3>Five habits that make the difference</h3>
          <ul className="pack-habits">
            <li><b>Build your Map — and lock it down.</b> A guess in your head isn&apos;t a plan. The Map makes your exposure honest and names your move.</li>
            <li><b>Do the reps.</b> Judgment and fluency are trained, not waited for. A rep in the Gym or a Workflow Rebuild each week compounds fast.</li>
            <li><b>Live in your pod.</b> Post the messy middle, not just the wins. Being expected to show up is what turns a plan into progress.</li>
            <li><b>Show up weekly.</b> Answer the prompt, read the shifts, hit a clinic. Momentum is a habit, not a burst.</li>
            <li><b>Re-score on the cadence.</b> The field moves, so your Map has to move with it — and re-scoring is where your effort shows up as a lower number.</li>
          </ul>
        </section>

        <section className="pack-sect">
          <span className="pack-kk">Do these first</span>
          <h3>Your first week</h3>
          <p className="pack-lead">Don&apos;t try to do everything. Work the onboarding in order — it&apos;s built to get you a real footing fast.</p>
          <div className="pack-cta-row">
            <Link href="/hub/welcome" className="pack-cta">Open your step-by-step Welcome →</Link>
            <Link href="/hub/map" className="pack-cta ghost">Or jump straight to your Map</Link>
          </div>
        </section>

        <section className="pack-sect">
          <span className="pack-kk">The house</span>
          <h3>Two rules hold this place up</h3>
          <p>Be generous, and be honest. Share what you learn, answer a question when you can, and post the real story — not the polished one. Everyone here is figuring out the same hard thing. That&apos;s Embrace and Together, lived — and it&apos;s why the community compounds for all of us.</p>
          <p className="pack-sign">— Adam</p>
        </section>
      </div>
    </>
  );
}
