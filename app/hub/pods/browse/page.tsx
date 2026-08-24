import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getBrowsablePods, getMyPods } from "@/lib/pods";
import { JoinButton } from "@/components/hub/pods/JoinButton";
import { NewPodForm } from "@/components/hub/pods/NewPodForm";

export const metadata = { title: "Browse Pods — Pivotum" };

export default async function BrowsePodsPage() {
  const { userId } = await auth();
  const [mine, all] = await Promise.all([getMyPods(userId), getBrowsablePods(userId)]);
  const others = all.filter((p) => !p.iAmIn);

  return (
    <>
      <div className="hub-top"><h1>Together Pods</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <p className="pods-intro">
          A Together Pod is your accountability cohort — a small group on the same path who hold you to what you
          commit to. Join one that fits, or don&apos;t see it? <b>Start your own</b> — Adam joins new pods to help
          until they find their feet.
        </p>

        <NewPodForm />

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
          <p className="feed-empty">No pods yet — start the first one above.</p>
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
