import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateProfile } from "@/lib/member";
import { resolveCareer, getDeepDive, availableStages, stageFor, type Stage } from "@/lib/deepdive";
import { hasSamplerPage } from "@/content/careers/registry";
import { CareerDeepDivePicker } from "@/components/hub/learn/CareerDeepDivePicker";
import { CAREER_OPTIONS } from "@/lib/deepdive";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = resolveCareer(slug);
  return { title: c ? `${c.name} — Deep Dive` : "Deep Dive" };
}

export default async function CareerDeepDivePage({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<{ stage?: string }> }) {
  const { slug } = await params;
  const { stage: stageParam } = await searchParams;
  const career = resolveCareer(slug);
  if (!career) notFound();

  const profile = await getOrCreateProfile();
  const stage: Stage = stageParam === "planning" || stageParam === "active" ? stageParam : stageFor(profile?.careerStage);

  const [dd, stages] = await Promise.all([getDeepDive(career.slug, stage), availableStages(career.slug)]);
  if (!dd) notFound();

  const samplerUrl = hasSamplerPage(career.slug) ? `/api/sampler-pdf?s=${career.slug}` : null;
  const otherStage: Stage = dd.stage === "active" ? "planning" : "active";
  const canToggle = stages.includes(otherStage);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/learn" className="back">‹ Learn</Link><span className="tt">Deep Dive</span></div>
      <div className="hub-body">
        <div className="dd-head">
          <p className="ck">Your field, mapped for the age of AI</p>
          <h2>{career.name}</h2>
          <div className="dd-headline">
            <span className="dd-score">{career.headlineScore.toFixed(1)}<span>/10</span></span>
            <span className="dd-score-l">exposure at <b>{career.headlineTrack}</b> — its most protected track. Higher = more of the work AI can already do.</span>
          </div>
          <div className="dd-controls">
            <CareerDeepDivePicker options={CAREER_OPTIONS} current={career.slug} />
            {canToggle && (
              <Link className="dd-stage-toggle" href={`/hub/learn/career/${career.slug}?stage=${otherStage}`}>
                {otherStage === "planning" ? "Still weighing it up? Read the planning version →" : "Already in the field? Read the working version →"}
              </Link>
            )}
          </div>
        </div>

        {(dd.sampleHtml || samplerUrl) && (
          <details className="dd-sample-fold">
            <summary>📄 Free sample — the short version{samplerUrl ? "" : ""}</summary>
            {dd.sampleHtml && <div className="dd-prose" dangerouslySetInnerHTML={{ __html: dd.sampleHtml }} />}
            {samplerUrl && <a className="dd-pdf" href={samplerUrl} target="_blank" rel="noopener noreferrer">Download the one-page PDF sample ↗</a>}
          </details>
        )}

        <div className="dd-prose deep" dangerouslySetInnerHTML={{ __html: dd.deepHtml }} />
      </div>
    </>
  );
}
