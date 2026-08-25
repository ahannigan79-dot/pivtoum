import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlay, playLeverLabel, AIMS } from "@/lib/plays";
import { CommitPlay } from "@/components/hub/playbook/CommitPlay";

export async function generateMetadata({ params }: { params: Promise<{ play: string }> }) {
  const { play } = await params;
  const p = getPlay(play);
  return { title: p ? `${p.title} — The Playbook` : "The Playbook" };
}

export default async function PlayPage({ params }: { params: Promise<{ play: string }> }) {
  const { play } = await params;
  const p = getPlay(play);
  if (!p) notFound();
  const aim = AIMS.find((a) => a.key === p.aim);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/playbook" className="back">‹ The Playbook</Link><span className="tt">{aim?.label ?? "Play"}</span></div>
      <div className="hub-body">
        <div className="play-head">
          <p className="play-lever big">{playLeverLabel(p)}</p>
          <h2>{p.title}</h2>
          <p className="play-thesis">{p.tagline}</p>
          <p className="play-fit"><span>Who it&rsquo;s for</span> {p.fit}</p>
        </div>

        <div className="hub-sectlabel">The how-to</div>
        <ol className="play-steps">
          {p.steps.map((s, i) => (
            <li key={i} className="play-step">
              <span className="play-sn">{i + 1}</span>
              <div>
                <p className="play-st">{s.title}</p>
                <p className="play-sd">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <CommitPlay title={p.firstMove} lever={p.lever} />
      </div>
    </>
  );
}
