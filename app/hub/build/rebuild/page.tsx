import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { REBUILDS, careerVariantCount } from "@/lib/rebuild";
import { getBuildReps } from "@/lib/build";
import { aiConfigured } from "@/lib/ai";
import { memberLane } from "@/lib/gym-generate";
import { GenerateRebuild } from "@/components/hub/build/GenerateRebuild";

export const metadata = { title: "Workflow Rebuild — Pivotum" };

export default async function RebuildLanding({ searchParams }: { searchParams: Promise<{ gen?: string }> }) {
  const { userId } = await auth();
  const [done, seed, { gen }] = await Promise.all([
    getBuildReps(userId),
    aiConfigured() ? memberLane(userId) : Promise.resolve(null),
    searchParams,
  ]);
  const countDone = (c: (typeof REBUILDS)[number]) =>
    c.lanes.reduce((n, l) => n + l.variants.filter((v) => done.has(`rebuild:${v.slug}`)).length, 0);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/build" className="back">‹ Build</Link><span className="tt">Workflow Rebuild</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">Workflow Rebuild</p>
          <h2>Watch your job get rebuilt — then rebuild yours.</h2>
          <p>Pick your field, then a lane, then a workflow. See it done today vs. rebuilt AI-native, where your value moves up the ladder, and the <b>five moves</b> that turn the rebuild into your own climb. Many examples per lane — work through the ones closest to your day.</p>
          <Link href="/hub/build/rebuild/browse" className="build-hero-link">Browse the full catalogue by career →</Link>
        </div>

        <Link href="/hub/build/rebuild/mine" className="build-tile" style={{ marginBottom: "24px" }}>
          <div className="bt-body">
            <span className="bt-kicker">New · put yourself in the driver's seat</span>
            <h3>Rebuild your own workflow, AI-native</h3>
            <p>Describe a workflow you actually run and Claude hands you a boss-shareable transformation doc — what changes, the risks, where your people move up, the gains. One per month.</p>
            <span className="bt-cta">Rebuild my workflow →</span>
          </div>
        </Link>

        {aiConfigured() && (
          <GenerateRebuild lane={seed?.lane ?? null} career={seed?.career ?? null} notice={gen ?? null} />
        )}

        <div className="hub-grid">
          {REBUILDS.map((c) => (
            <Link key={c.slug} href={`/hub/build/rebuild/${c.slug}`} className="card">
              <p className="ck">{careerVariantCount(c)} workflows{countDone(c) > 0 ? ` · ${countDone(c)} done` : ""}</p>
              <h3>{c.career}</h3>
              <p>{c.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
