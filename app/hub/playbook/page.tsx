import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getTrajectory } from "@/lib/trajectory";
import { playsByAim, recommendedPlays, playLeverLabel, type Play } from "@/lib/plays";

export const metadata = { title: "The Playbook — Winning in the Age of AI" };

function PlayCard({ p, rec = false }: { p: Play; rec?: boolean }) {
  return (
    <Link href={`/hub/playbook/${p.slug}`} className={"play-card" + (rec ? " rec" : "")}>
      <p className="play-lever">{playLeverLabel(p)}</p>
      <h3>{p.title}</h3>
      <p className="play-tag">{p.tagline}</p>
      <span className="play-go">Read the how-to →</span>
    </Link>
  );
}

export default async function PlaybookPage() {
  const { userId } = await auth();
  const t = await getTrajectory(userId);
  const recommended = recommendedPlays(t.computed);
  const groups = playsByAim();

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub" className="back">‹ Evolve</Link><span className="tt">The Playbook</span></div>
      <div className="hub-body">
        <div className="build-hero">
          <p className="ck">📋 The Playbook</p>
          <h2>Not sure what to do next? Start here.</h2>
          <p>A library of proven plays for pulling your levers — each with a how-to guide and a first move you can commit in one tap. {t.hasMap ? "The ones matched to your Map are up top." : "Build your Map and we’ll point you to the ones that fit."}</p>
        </div>

        {recommended.length > 0 && (
          <div className="play-rec">
            <div className="hub-sectlabel">Recommended for you · from your Map</div>
            <div className="hub-grid">
              {recommended.map((p) => <PlayCard key={p.slug} p={p} rec />)}
            </div>
          </div>
        )}

        {groups.map((g) => (
          <div key={g.aim}>
            <div className="hub-sectlabel">{g.label}</div>
            <p className="play-aim-blurb">{g.blurb}</p>
            <div className="hub-grid">
              {g.plays.map((p) => <PlayCard key={p.slug} p={p} />)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
