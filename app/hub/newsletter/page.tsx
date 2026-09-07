import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { aiConfigured } from "@/lib/ai";
import { getDraftIssue, listIssues } from "@/lib/newsletter";
import { NewsletterComposer } from "@/components/hub/newsletter/NewsletterComposer";

export const metadata = { title: "Monthly newsletter — Winning in the Age of AI" };

function fmt(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function NewsletterPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();

  const [draft, issues] = await Promise.all([getDraftIssue(), listIssues()]);
  const sent = issues.filter((i) => i.status === "sent");

  return (
    <>
      <div className="hub-top">
        <h1>Monthly newsletter</h1>
        <span className="sp" />
        <span className="hub-pill">Founder view</span>
      </div>
      <div className="hub-body">
        <p className="scout-intro">
          The members&apos; weekly read is automatic on their dashboard. This is the monthly send: draft it from the
          month&apos;s article-scout roll-up, edit it in your voice, and send it to members who accept community email.
          Every send is kept below as a record.
        </p>

        <NewsletterComposer initialSubject={draft?.subject ?? ""} initialBody={draft?.body ?? ""} aiOn={aiConfigured()} />

        {sent.length > 0 && (
          <>
            <div className="hub-sectlabel">Sent issues</div>
            <ul className="nl-history">
              {sent.map((i) => (
                <li key={i.id} className="nl-hist">
                  <span className="nl-hist-subj">{i.subject}</span>
                  <span className="nl-hist-meta">{i.sentAt ? fmt(i.sentAt) : fmt(i.createdAt)} · {i.recipientCount} recipient{i.recipientCount === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
