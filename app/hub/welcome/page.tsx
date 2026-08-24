import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getPlan } from "@/lib/plan";
import { NextAction } from "@/components/hub/dashboard/NextAction";
import { Checklist } from "@/components/hub/dashboard/Checklist";

export const metadata = { title: "Welcome — Pivotum" };

export default async function WelcomePage() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const plan = await getPlan(userId);

  const heroNum = plan ? Math.min(plan.activatedCount + 1, plan.activationTotal) : 0;

  return (
    <>
      <div className="hub-top"><h1>Welcome</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">
          Welcome in, <b>{first}</b>. You&apos;re here because your career is worth defending — and because
          winning in the age of AI is a game you can actually play well. This page is your on-ramp:
          do these in order and you&apos;ll be in motion fast.
        </p>

        {plan && plan.fullyActivated ? (
          <div className="cta-hero">
            <div>
              <p className="ck">✓ You&apos;re set up</p>
              <h3>You&apos;ve completed your opening</h3>
              <p>Everything&apos;s in motion. Your command dashboard is where you run the game from here.</p>
            </div>
            <Link href="/hub" className="btn-primary">Go to Evolve →</Link>
          </div>
        ) : (
          plan?.next && <NextAction step={plan.next} stepNum={heroNum} total={plan.activationTotal} />
        )}

        {plan && !plan.fullyActivated && (
          <Checklist steps={plan.steps} done={plan.activatedCount} total={plan.activationTotal} />
        )}

        <div className="hub-sectlabel">How the Winning Loop works</div>
        <div className="hub-grid">
          <div className="card"><p className="ck">🧭 Map</p><h3>See where you stand</h3><p>Your exposure, what&apos;s driving it, and your one winning move — scored for your exact lane.</p></div>
          <div className="card"><p className="ck">📚 Learn</p><h3>Understand the levers</h3><p>The six forces that decide who&apos;s exposed and who&apos;s protected. Your score becomes dials you can turn.</p></div>
          <div className="card"><p className="ck">🛠 Build</p><h3>Do the work</h3><p>Master the machine and deepen what AI can&apos;t take — the Gym, the Operator, your rebuilds.</p></div>
          <div className="card"><p className="ck">📈 Evolve</p><h3>Run the game</h3><p>Your command dashboard: commit to moves, ship them, and watch your trajectory bend.</p></div>
        </div>

        <div className="hub-sectlabel">Get oriented</div>
        <div className="hub-grid">
          <Link href="/hub/events/welcome" className="card"><p className="ck">📅 Your 1:1</p><h3>Book your welcome with Adam</h3><p>Sixty minutes to walk your Map together and set your first moves.</p></Link>
          <Link href="/hub/community" className="card"><p className="ck">💬 Community</p><h3>Meet the room</h3><p>Introduce yourself, see what others are working on, ask anything.</p></Link>
          <Link href="/hub" className="card"><p className="ck">◆ Evolve</p><h3>Your command dashboard</h3><p>Where your stats, targets and achievements live once you&apos;re rolling.</p></Link>
        </div>
      </div>
    </>
  );
}
