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
      </div>
    </>
  );
}
