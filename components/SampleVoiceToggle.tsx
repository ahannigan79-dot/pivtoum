import Link from "next/link";

/**
 * Two-voice switch on a free AI Exposure Report. Same scores, two framings: the
 * *career* version speaks to someone already in the field; the *studying*
 * version to someone still choosing what to study. Mirrors the Deep Dive's
 * active/planning toggle. Only rendered when both voices exist for a career.
 *
 * A neutral segmented control — no accent wash, no icons — so it reads as
 * plain chrome, not data.
 */
export function SampleVoiceToggle({
  slug,
  current,
}: {
  slug: string;
  current: "career" | "studying";
}) {
  return (
    <div className="voice-seg-wrap">
      <span className="voice-seg-label">Written for</span>
      <div className="voice-seg" role="group" aria-label="Choose your version">
        <Link
          className={`voice-seg-tab${current === "career" ? " on" : ""}`}
          href={`/careers/${slug}`}
          aria-current={current === "career" ? "page" : undefined}
        >
          People in the field
        </Link>
        <Link
          className={`voice-seg-tab${current === "studying" ? " on" : ""}`}
          href={`/careers/${slug}/studying`}
          aria-current={current === "studying" ? "page" : undefined}
        >
          People still studying
        </Link>
      </div>
    </div>
  );
}
