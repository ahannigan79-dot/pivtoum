import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { REBUILDS } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";
import { WorkflowRebuild } from "@/components/hub/build/WorkflowRebuild";

export async function generateMetadata({ params }: { params: Promise<{ workflow: string }> }) {
  const { workflow } = await params;
  const r = REBUILDS[workflow];
  return { title: r ? `Workflow Rebuild — ${r.career}` : "Workflow Rebuild — Pivotum" };
}

export default async function Page({ params }: { params: Promise<{ workflow: string }> }) {
  const { workflow } = await params;
  const r = REBUILDS[workflow];
  if (!r) notFound();
  const { userId } = await auth();
  const done = (await getBuildReps(userId)).has(`rebuild:${r.slug}`);

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/build/rebuild" className="back">‹ Workflow Rebuild</Link>
        <span className="tt">{r.career}</span>
      </div>
      <div className="hub-body">
        <WorkflowRebuild rebuild={r} done={done} />
      </div>
    </>
  );
}
