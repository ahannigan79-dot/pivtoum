import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CAREER_BY_SLUG } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";

export async function generateMetadata({ params }: { params: Promise<{ career: string }> }) {
  const { career } = await params;
  const c = CAREER_BY_SLUG[career];
  return { title: c ? `Workflow Rebuild — ${c.career}` : "Workflow Rebuild — Pivotum" };
}

export default async function CareerPage({ params }: { params: Promise<{ career: string }> }) {
  const { career } = await params;
  const c = CAREER_BY_SLUG[career];
  if (!c) notFound();
  const { userId } = await auth();
  const done = await getBuildReps(userId);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build/rebuild" className="back">‹ Workflow Rebuild</Link><span className="tt">{c.career}</span></div>
      <div className="hub-body">
        <p className="hub-lead">Pick a workflow closest to your day. Each shows it done today vs. rebuilt AI-native — the more you work through, the sharper your read on where your value moves.</p>
        {c.lanes.map((lane) => {
          const laneDone = lane.variants.filter((v) => done.has(`rebuild:${v.slug}`)).length;
          return (
            <div key={lane.slug} className="gym-lane">
              <div className="gym-lane-head">
                <div className="hub-sectlabel">{lane.name}</div>
                <span className="gym-lane-count">{laneDone}/{lane.variants.length} done</span>
              </div>
              <div className="hub-grid">
                {lane.variants.map((v) => (
                  <Link key={v.slug} href={`/hub/build/rebuild/${c.slug}/${v.slug}`} className="card">
                    <p className="ck">🔧 Workflow{done.has(`rebuild:${v.slug}`) ? " · done ✓" : ""}</p>
                    <h3>{v.title}</h3>
                    <p>{v.short}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
