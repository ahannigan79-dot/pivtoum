import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPlay, playLeverLabel, playBenefitReading, playExample, AIMS, type PlayStep } from "@/lib/plays";
import { getFocus, canAddFocus } from "@/lib/focus";
import { getTrajectory } from "@/lib/trajectory";
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
  const [myFocus, roomForFocus, traj] = await Promise.all([
    userId ? getFocus(userId) : Promise.resolve([]),
    userId ? canAddFocus(userId) : Promise.resolve(false),
    getTrajectory(userId),
  ]);
  const alreadyFocus = myFocus.some((g) => g.playSlug === p.slug);
  const example = playExample(p, traj.computed?.career, traj.computed?.lane);

  // v2 plays group their steps into phases; classic plays render a flat list.
  const phased = !!p.phases?.length;
  const StepLi = (s: PlayStep, i: number) => {
    return (
      <li key={i} className={"play-step" + (i === 0 ? " first" : "")}>
        <span className="play-sn">{i + 1}</span>
        <div>
          <p className="play-st">{s.title}{i === 0 && <span className="play-start">Start here</span>}</p>
          <p className="play-sd">{s.detail}</p>
          {s.artifact && <p className="play-artifact"><span>You&rsquo;ll have</span> {s.artifact}</p>}
        </div>
      </li>
    );
  };

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
            {p.firstMoveWindow && <span className="play-chip">▸ First move {p.firstMoveWindow}</span>}
            <span className="play-chip benefit">↓ {playBenefitReading(p)}</span>
          </div>
          <p className="play-fit"><span>Who it&rsquo;s for</span> {p.fit}</p>
        </div>

        {p.thesis && (
          <div className="play-block play-why">
            <p className="play-block-k">Why this wins now</p>
            <p>{p.thesis}</p>
          </div>
        )}

        {example && (
          <div className="play-block play-example">
            <p className="play-block-k">In {example.field.toLowerCase()}</p>
            <p>{example.story}</p>
          </div>
        )}

        <div className="hub-sectlabel">The how-to{p.firstMoveWindow ? " — a campaign, not a sprint" : ""}</div>
        {phased ? (
          <div className="play-phases">
            {p.phases!.map((ph, pi) => {
              const steps = p.steps.filter((s) => s.phase === ph.label);
              return (
                <section className="play-phase" key={pi}>
                  <div className="play-phase-head">
                    <span className="play-phase-lab">{ph.label}</span>
                    <p className="play-phase-goal">{ph.goal}</p>
                  </div>
                  <ol className="play-steps">
                    {steps.map((s) => StepLi(s, p.steps.indexOf(s)))}
                  </ol>
                  <p className="play-phase-mile"><span>Milestone</span> {ph.milestone}</p>
                </section>
              );
            })}
          </div>
        ) : (
          <ol className="play-steps">
            {p.steps.map((s, i) => StepLi(s, i))}
          </ol>
        )}

        {p.artifacts && p.artifacts.length > 0 && (
          <div className="play-block">
            <p className="play-block-k">What you&rsquo;ll have built</p>
            <ul className="play-list check">{p.artifacts.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}

        {p.traps && p.traps.length > 0 && (
          <div className="play-block play-traps">
            <p className="play-block-k">Watch out for</p>
            <ul className="play-list warn">{p.traps.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}

        {p.signals && p.signals.length > 0 && (
          <div className="play-block">
            <p className="play-block-k">You&rsquo;ll know it&rsquo;s working when</p>
            <ul className="play-list signal">{p.signals.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}

        {p.payoff && (
          <div className="play-block play-payoff">
            <p className="play-block-k">The payoff</p>
            <p>{p.payoff}</p>
          </div>
        )}

        <div className="play-actions">
          <AdoptFocus slug={p.slug} already={alreadyFocus} atCap={!roomForFocus && !alreadyFocus} />
          <p className="play-commit-first"><span>Your first move:</span> {p.firstMove}</p>
        </div>
      </div>
    </>
  );
}
