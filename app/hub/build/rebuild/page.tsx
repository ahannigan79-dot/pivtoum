import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { REBUILDS, careerVariantCount } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";

export const metadata = { title: "Workflow Rebuild — Pivotum" };

export default async function RebuildLanding() {
  const { userId } = await auth();
  const done = await getBuildReps(userId);
  const countDone = (c: (typeof REBUILDS)[number]) =>
    c.lanes.reduce((n, l) => n + l.variants.filter((v) => done.has(`rebuild:${v.slug}`)).length, 0);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Workflow Rebuild</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">🔧 Workflow Rebuild</p>
          <h2>Watch your job get rebuilt — then rebuild yourself.</h2>
          <p>Pick your field, then a lane, then a workflow. See it done today vs. rebuilt AI-native, where your value moves up the ladder, and the <b>five moves</b> that turn the rebuild into your own climb. Many examples per lane — work through the ones closest to your day.</p>
        </div>
        <div className="hub-grid">
          {REBUILDS.map((c) => (
            <Link key={c.slug} href={`/hub/build/rebuild/${c.slug}`} className="card">
              <p className="ck">🔧 {careerVariantCount(c)} workflows{countDone(c) > 0 ? ` · ${countDone(c)} done` : ""}</p>
              <h3>{c.career}</h3>
              <p>{c.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
