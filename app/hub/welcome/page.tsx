import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { getOnboarding } from "@/lib/onboarding";
import { MarkBooked } from "@/components/hub/welcome/MarkBooked";

export const metadata = { title: "Get started — Pivotum" };

export default async function WelcomePage() {
  const profile = await getOrCreateProfile();
  const first = (profile?.displayName ?? "there").split(" ")[0];
  const { userId } = await auth();
  const onb = await getOnboarding(userId);

  return (
    <>
      <div className="hub-top"><h1>Get started</h1><span className="sp" /></div>
      <div className="hub-body">
        {onb?.complete ? (
          <div className="onb-done">
            <span className="onb-done-star">★</span>
            <h2>You&apos;re all set, {first}.</h2>
            <p>Setup&apos;s done — you&apos;ve mapped where you stand, you&apos;re in a pod, and your first move is in motion.
              From here it&apos;s the Winning Loop: re-score, ship moves, show up for your pod.</p>
            <Link href="/hub" className="btn-primary">Go to your dashboard →</Link>
          </div>
        ) : (
          <>
            <p className="hub-lead">
              Welcome in, <b>{first}</b>. Here&apos;s your path in — five steps, in order. Do the one that&apos;s lit up,
              and the next unlocks. It takes about half an hour end to end.
            </p>

            {onb && (
              <div className="onb-progress">
                <div className="onb-bar"><span style={{ width: `${(onb.doneCount / onb.total) * 100}%` }} /></div>
                <span className="onb-count">{onb.doneCount} of {onb.total} done</span>
              </div>
            )}

            <ol className="onb">
              {onb?.steps.map((s, i) => {
                const isCurrent = onb.current?.key === s.key;
                const state = s.done ? "done" : isCurrent ? "current" : s.locked ? "locked" : "upcoming";
                return (
                  <li key={s.key} className={`onb-step ${state}`}>
                    <span className="onb-mark">{s.done ? "✓" : i + 1}</span>
                    <div className="onb-body">
                      <h3 className="onb-title">{s.label}</h3>
                      {(isCurrent || (!s.done && !s.locked)) && <p className="onb-blurb">{s.blurb}</p>}
                      {s.done ? (
                        <span className="onb-tag done">Done ✓</span>
                      ) : s.locked ? (
                        <span className="onb-tag locked">🔒 {s.lockNote}</span>
                      ) : (
                        <span className="onb-actions">
                          <Link href={s.href} className={isCurrent ? "btn-primary" : "gcta"}>{s.cta} →</Link>
                          {s.key === "welcome" && <MarkBooked />}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </>
  );
}
