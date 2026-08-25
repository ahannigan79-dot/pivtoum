import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getGeneratedRebuild } from "@/lib/rebuild-generate";
import { getBuildReps } from "@/lib/build";
import { WorkflowRebuild } from "@/components/hub/build/WorkflowRebuild";

export const metadata = { title: "Workflow Rebuild — fresh" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hit = await getGeneratedRebuild(id);
  if (!hit) notFound();
  const { userId } = await auth();
  const done = (await getBuildReps(userId)).has(`rebuild:${hit.variant.slug}`);

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/build/rebuild" className="back">‹ Workflow Rebuild</Link>
        <span className="tt">{hit.career} · fresh ✦</span>
      </div>
      <div className="hub-body">
        <p className="gym-fresh-note">A fresh rebuild, generated for your lane. Generate another whenever you want to see a different workflow.</p>
        <WorkflowRebuild variant={hit.variant} careerName={hit.career} done={done} />
      </div>
    </>
  );
}
