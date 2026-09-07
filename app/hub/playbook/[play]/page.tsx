import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPlay, playLeverLabel, playBenefitReading, AIMS } from "@/lib/plays";
import { getFocus, canAddFocus } from "@/lib/focus";
import { AdoptFocus } from "@/components/hub/playbook/AdoptFocus";

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
  const { userId } = await auth();
  const [myFocus, roomForFocus] = await Promise.all([
    userId ? getFocus(userId) : Promise.resolve([]),
    userId ? canAddFocus(userId) : Promise.resolve(false),
  ]);
  const alreadyFocus = myFocus.some((g) => g.playSlug === p.slug);

  return (
    <>
      <div className="hub-toolbar"><Link href="/hub/playbook" className="back">‹ The Playbook</Link><span className="tt">{aim?.label ?? "Play"}</span></div>
      <div className="hub-body">
        <div className="play-head">
          <p className="play-lever big">{playLeverLabel(p)}</p>
          <h2>{p.title}</h2>
          <p className="play-thesis">{p.tagline}</p>
          <div className="play-meta">
            <span className={`play-chip diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
            <span className="play-chip">⏱ {p.duration}</span>
            <span className="play-chip benefit">↓ {playBenefitReading(p)}</span>
          </div>
          <p className="play-fit"><span>Who it&rsquo;s for</span> {p.fit}</p>
        </div>

        <div className="hub-sectlabel">The how-to</div>
        <ol className="play-steps">
          {p.steps.map((s, i) => (
            <li key={i} className={"play-step" + (i === 0 ? " first" : "")}>
              <span className="play-sn">{i + 1}</span>
              <div>
                <p className="play-st">{s.title}{i === 0 && <span className="play-start">Start here</span>}</p>
                <p className="play-sd">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="play-actions">
          <AdoptFocus slug={p.slug} already={alreadyFocus} atCap={!roomForFocus && !alreadyFocus} />
          <p className="play-commit-first"><span>Your first move:</span> {p.firstMove}</p>
        </div>
      </div>
    </>
  );
}
