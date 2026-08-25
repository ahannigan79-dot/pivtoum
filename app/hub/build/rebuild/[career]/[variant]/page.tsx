import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { findVariant } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";
import { WorkflowRebuild } from "@/components/hub/build/WorkflowRebuild";

export async function generateMetadata({ params }: { params: Promise<{ career: string; variant: string }> }) {
  const { career, variant } = await params;
  const hit = findVariant(career, variant);
  return { title: hit ? `${hit.variant.title} — Workflow Rebuild` : "Workflow Rebuild — Pivotum" };
}

export default async function Page({ params }: { params: Promise<{ career: string; variant: string }> }) {
  const { career, variant } = await params;
  const hit = findVariant(career, variant);
  if (!hit) notFound();
  const { userId } = await auth();
  const done = (await getBuildReps(userId)).has(`rebuild:${hit.variant.slug}`);

  return (
    <>
      <div className="hub-toolbar">
        <Link href={`/hub/build/rebuild/${hit.career.slug}`} className="back">‹ {hit.career.career}</Link>
        <span className="tt">{hit.lane.name}</span>
      </div>
      <div className="hub-body">
        <WorkflowRebuild variant={hit.variant} careerName={hit.career.career} done={done} />
      </div>
    </>
  );
}
