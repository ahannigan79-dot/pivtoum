import Link from "next/link";

/**
 * Two-voice switch on a free Career Map. Same scores, two framings: the
 * *career* version speaks to someone already in the field; the *studying*
 * version to someone still choosing what to study. Mirrors the Deep Dive's
 * active/planning toggle. Only rendered when both voices exist for a career.
 */
export function SampleVoiceToggle({
  slug,
  current,
}: {
  slug: string;
  current: "career" | "studying";
}) {
  const toStudying = current === "career";
  const href = toStudying ? `/careers/${slug}/studying` : `/careers/${slug}`;
  return (
    <div className="voice-toggle" role="group" aria-label="Choose your version">
      <span className={`voice-tab${current === "career" ? " on" : ""}`} aria-current={current === "career"}>
        💼 In a career
      </span>
      <span className={`voice-tab${current === "studying" ? " on" : ""}`} aria-current={current === "studying"}>
        📚 Studying
      </span>
      <Link className="voice-switch" href={href}>
        {toStudying ? "Still choosing what to study? Read the studying version →" : "Already working in the field? Read the career version →"}
      </Link>
    </div>
  );
}
