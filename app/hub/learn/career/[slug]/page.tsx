import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveCareer, CAREER_OPTIONS } from "@/lib/deepdive";
import { hasSamplerPage } from "@/content/careers/registry";
import { DeepDiveReader } from "@/components/hub/learn/DeepDiveReader";
import { CareerDeepDivePicker } from "@/components/hub/learn/CareerDeepDivePicker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = resolveCareer(slug);
  return { title: c ? `${c.name} — Deep Dive` : "Deep Dive" };
}

export default async function CareerDeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = resolveCareer(slug);
  if (!career) notFound();
  const samplerUrl = hasSamplerPage(career.slug) ? `/api/sampler-pdf?s=${career.slug}` : null;

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
          <CareerDeepDivePicker options={CAREER_OPTIONS} current={career.slug} />
        </div>

        <DeepDiveReader slug={career.slug} samplerUrl={samplerUrl} />
      </div>
    </>
  );
}
