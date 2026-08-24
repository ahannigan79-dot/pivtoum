import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getBrowsablePods, getMyPods } from "@/lib/pods";
import { JoinButton } from "@/components/hub/pods/JoinButton";
import { NewPodForm } from "@/components/hub/pods/NewPodForm";

export const metadata = { title: "Pods — Pivotum" };

export default async function PodsPage() {
  const { userId } = await auth();
  const profile = await getOrCreateProfile();
  const [mine, all] = await Promise.all([getMyPods(userId), getBrowsablePods(userId)]);
  const others = all.filter((p) => !p.iAmIn);
  const founder = isFounder(profile);

  return (
    <>
      <div className="hub-top"><h1>Pods</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <p className="pods-intro">
          A pod is your accountability cohort — a small group on the same path who hold you to what you commit to.
          You move faster when someone&apos;s expecting your next step.
        </p>

        {founder && <NewPodForm />}

        {mine.length > 0 && (
          <>
            <div className="hub-sectlabel">Your pods</div>
            <div className="pod-grid">
              {mine.map((p) => (
                <Link key={p.id} href={`/hub/pods/${p.slug}`} className="pod-card mine">
                  <h3>{p.name}</h3>
                  {p.description && <p>{p.description}</p>}
                  <span className="pod-enter">Open pod →</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="hub-sectlabel">{others.length ? "Browse pods" : "All pods"}</div>
        {all.length === 0 ? (
          <p className="feed-empty">
            No pods yet.{founder ? " Create the first one above." : " Your welcome session with Adam will place you in the right cohort."}
          </p>
        ) : others.length === 0 ? (
          <p className="feed-empty">You&apos;re in every pod there is right now.</p>
        ) : (
          <div className="pod-grid">
            {others.map((p) => (
              <div key={p.id} className="pod-card">
                <Link href={`/hub/pods/${p.slug}`} className="pod-card-link">
                  <h3>{p.name}</h3>
                  {p.description && <p>{p.description}</p>}
                </Link>
                <div className="pod-card-foot">
                  <span className="pod-count">{p.memberCount} {p.memberCount === 1 ? "member" : "members"}</span>
                  <JoinButton slug={p.slug} joined={p.iAmIn} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
