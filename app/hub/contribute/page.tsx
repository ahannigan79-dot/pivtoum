import { auth } from "@clerk/nextjs/server";
import { getMySubmissions } from "@/lib/submissions";
import { timeAgo } from "@/lib/community";
import { ContributeForms } from "@/components/hub/contribute/ContributeForms";

export const metadata = { title: "Contribute — Winning in the Age of AI" };

const STATUS_LABEL: Record<string, string> = { pending: "In review", approved: "Live", declined: "Not this time" };

export default async function ContributePage() {
  const { userId } = await auth();
  const mine = userId ? await getMySubmissions(userId) : [];

  return (
    <>
      <div className="hub-top"><h1>Contribute</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <p className="hub-lead">
          The best of this community comes from its members. Host a session or write an article —
          Adam reviews each one, then it goes live to the room.
        </p>

        <ContributeForms />

        {mine.length > 0 && (
          <>
            <div className="hub-sectlabel">Your submissions</div>
            <div className="sub-list">
              {mine.map((s) => (
                <article key={s.id} className={"sub-card s-" + s.status}>
                  <div className="sub-top">
                    <span className="sub-kind">{s.kind === "session" ? "Session" : "Article"}</span>
                    <span className={"sub-status st-" + s.status}>{STATUS_LABEL[s.status] ?? s.status}</span>
                    <span className="sub-when">{timeAgo(s.createdAt)}</span>
                  </div>
                  <h3>{s.title}</h3>
                  {s.status === "declined" && s.reviewNote && (
                    <p className="sub-note"><b>Adam:</b> {s.reviewNote}</p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
