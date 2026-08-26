import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { listPendingSubmissions } from "@/lib/submissions";
import { timeAgo } from "@/lib/community";
import { SubmissionReview } from "@/components/hub/submissions/SubmissionReview";

export const metadata = { title: "Submissions — Winning in the Age of AI" };

function fmtWhen(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
const TYPE_LABEL: Record<string, string> = {
  sme: "SME session", open_stage: "Open Stage", wins: "Celebrate the Wins", social: "Social",
};

export default async function SubmissionsPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();
  const pending = await listPendingSubmissions();

  return (
    <>
      <div className="hub-top"><h1>Submissions</h1><span className="sp" /><span className="hub-pill">Founder view</span></div>
      <div className="hub-body hub-feed">
        <p className="hub-lead">
          Member-proposed sessions and articles. Approve to publish — a session goes onto the calendar
          hosted by the member; an article publishes to the feed under their name. Decline to send it
          back with a note.
        </p>

        {pending.length === 0 ? (
          <p className="feed-empty">Nothing waiting. When members propose sessions or articles, they land here. ✅</p>
        ) : (
          <div className="sub-list">
            {pending.map((s) => {
              const when = s.kind === "session" ? fmtWhen(s.details.startsAt) : null;
              return (
                <article key={s.id} className="sub-card review">
                  <div className="sub-top">
                    <span className="sub-kind">{s.kind === "session" ? "Session" : "Article"}</span>
                    <span className="sub-meta">{s.authorName} · {timeAgo(s.createdAt)}</span>
                  </div>
                  <h3>{s.title}</h3>
                  {s.kind === "session" && (
                    <p className="sub-detail">
                      {TYPE_LABEL[s.details.type ?? "sme"] ?? "Session"}
                      {when ? ` · proposed ${when}` : " · no time proposed"}
                      {s.details.durationMins ? ` · ${s.details.durationMins}m` : ""}
                      {s.details.joinUrl ? " · has join link" : ""}
                    </p>
                  )}
                  <p className="sub-body">{s.body.length > 900 ? s.body.slice(0, 900) + "…" : s.body}</p>
                  <SubmissionReview id={s.id} />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
