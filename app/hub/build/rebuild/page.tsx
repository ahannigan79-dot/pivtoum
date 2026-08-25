import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { REBUILD_LIST } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";

export const metadata = { title: "Workflow Rebuild — Pivotum" };

export default async function RebuildLanding() {
  const { userId } = await auth();
  const done = await getBuildReps(userId);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Workflow Rebuild</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">🔧 Workflow Rebuild</p>
          <h2>Watch your job get rebuilt — then rebuild yourself.</h2>
          <p>Pick your field. See a core workflow done today vs. rebuilt AI-native, where your value moves up the ladder, and the <b>five moves</b> that turn the rebuild into your own climb.</p>
        </div>
        <div className="hub-grid">
          {REBUILD_LIST.map((r) => (
            <Link key={r.slug} href={`/hub/build/rebuild/${r.slug}`} className="card">
              <p className="ck">🔧 Rebuild{done.has(`rebuild:${r.slug}`) ? " · done ✓" : ""}</p>
              <h3>{r.career}</h3>
              <p>{r.short}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
