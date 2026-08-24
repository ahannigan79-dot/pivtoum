import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { getOpenReports } from "@/lib/moderation";
import { timeAgo } from "@/lib/community";
import { dismissReports, removePost } from "./actions";

export const metadata = { title: "Moderation — Winning in the Age of AI" };

export default async function ModerationPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();
  const reports = await getOpenReports();

  return (
    <>
      <div className="hub-top"><h1>Moderation</h1><span className="sp" /><span className="hub-pill">Founder view</span></div>
      <div className="hub-body hub-feed">
        {reports.length === 0 ? (
          <p className="feed-empty">Nothing reported. The community&apos;s keeping itself honest. ✅</p>
        ) : (
          <div className="mod-list">
            {reports.map((r) => (
              <article key={r.postId} className="mod-card">
                <div className="mod-top">
                  <span className="mod-count">{r.count} report{r.count === 1 ? "" : "s"}</span>
                  <span className="mod-meta">{r.authorName} · {r.podName} · {timeAgo(r.firstAt)}</span>
                </div>
                <p className="mod-body">{r.body.length > 400 ? r.body.slice(0, 400) + "…" : r.body}</p>
                {r.reasons.length > 0 && (
                  <div className="mod-reasons">
                    {r.reasons.map((reason, i) => <span key={i} className="mod-reason">“{reason}”</span>)}
                  </div>
                )}
                <div className="mod-actions">
                  <Link href={r.href} className="mod-view">View in context ↗</Link>
                  <span className="sp" />
                  <form action={dismissReports.bind(null, r.postId)}>
                    <button type="submit" className="mod-keep">Keep post</button>
                  </form>
                  <form action={removePost.bind(null, r.postId)}>
                    <button type="submit" className="mod-remove">Remove post</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
