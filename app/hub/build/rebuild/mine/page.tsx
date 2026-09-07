import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile } from "@/lib/member";
import { aiConfigured } from "@/lib/ai";
import { latestTransform, daysUntilNext } from "@/lib/workflow-transform";
import { TransformForm } from "@/components/hub/build/TransformForm";
import { OwnerTransform } from "@/components/hub/build/OwnerTransform";

export const metadata = { title: "Rebuild my workflow — Winning in the Age of AI" };

export default async function MyWorkflowPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { userId } = await auth();
  const { err } = await searchParams;
  const [profile, last] = await Promise.all([getOrCreateProfile(), userId ? latestTransform(userId) : Promise.resolve(null)]);
  const wait = daysUntilNext(last?.createdAt);
  const canGen = aiConfigured() && wait === 0;

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build/rebuild" className="back">‹ Workflow Rebuild</Link><span className="tt">Rebuild my workflow</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">Put yourself in the driver's seat</p>
          <h2>Rebuild your own workflow, AI-native.</h2>
          <p>Describe a workflow you actually run. Pivotum rebuilds it AI-native and hands you a sharp, boss-shareable transformation doc — what changes, where the risks are, where your people move up, and the gains. The artifact that makes you the person who saw it first.</p>
        </div>

        {err === "limit" && <p className="wt-alert">You've used this month's rebuild. It refreshes so each one is worth doing — your latest is below.</p>}
        {err === "failed" && <p className="wt-alert">That didn't come through. Give it another go in a moment.</p>}
        {err === "input" && <p className="wt-alert">Add the workflow name and how it's done today, then try again.</p>}
        {err?.startsWith("q_") && (
          <div className="wt-standard">
            <p className="wt-standard-h">
              {err === "q_name" ? "Give the workflow a real name first."
                : err === "q_steps" ? "Break it into the actual steps."
                : "That's too thin to rebuild well."}
            </p>
            <p className="wt-standard-lead">A rebuild is only as sharp as what you put in — and this one didn&apos;t clear the bar. Here&apos;s exactly what it needs before it&apos;s worth running (it&apos;s one rebuild a month, so make it count):</p>
            <ul className="wt-standard-list">
              <li><b>A clear name</b> — what the workflow produces, e.g. &ldquo;Weekly client status report.&rdquo;</li>
              <li><b>The steps as they actually run</b> — at least three or four, in order.</li>
              <li><b>Who does each step, and roughly how long</b> it takes.</li>
              <li><b>Where the time really goes</b> — the slow, manual, or error-prone part.</li>
            </ul>
            <p className="wt-standard-tip">Nothing came through — this didn&apos;t use your monthly rebuild. Hit <b>&ldquo;Start from a template&rdquo;</b> below and fill in the shape; that clears the bar every time.</p>
          </div>
        )}

        {canGen ? (
          <div className="wt-formwrap"><TransformForm role={profile?.displayName ?? ""} /></div>
        ) : !aiConfigured() ? (
          <p className="wt-alert">Workflow rebuild isn&apos;t available just yet.</p>
        ) : (
          <div className="wt-locked">
            <p><b>Next rebuild in {wait} day{wait === 1 ? "" : "s"}.</b> One per month keeps each one worth the effort. Your latest is below — share it, act on it, bring it to your lead.</p>
          </div>
        )}

        {last && <OwnerTransform id={last.id} workflow={last.workflow} doc={last.doc} when={last.createdAt} shareToken={last.shareToken} />}
      </div>
    </>
  );
}
