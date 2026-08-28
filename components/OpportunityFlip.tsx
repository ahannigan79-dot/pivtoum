import Link from "next/link";
import type { Career } from "@/data/careers";
import { SITE } from "@/lib/site";
import { opportunityOpening } from "@/lib/opportunity";

/**
 * The payoff beat of an AI Exposure Report: the turn from exposure to
 * opportunity. Fixed frame ("starting line, not your verdict" … "win in the
 * age of AI") wraps the career-specific opening line, then the trial CTA. Same
 * language as the /map reveal so the funnel tells one story.
 */
export function OpportunityFlip({
  career,
  voice,
}: {
  career: Career;
  voice: "career" | "studying";
}) {
  return (
    <aside className="opp">
      <span className="opp-k">You came to see how exposed you are &mdash; here&rsquo;s the opening</span>
      <h3 className="opp-h">This is your starting line, not your verdict.</h3>
      <p className="opp-body">{opportunityOpening(career, voice)}</p>
      <p className="opp-line">
        The community is your opportunity to <b>win in the age of AI</b>.
      </p>
      <Link className="opp-cta" href={SITE.join}>
        Start your free trial &rarr;
      </Link>
      <div className="opp-sub">Seven days free &middot; your Map and progress come with you</div>
    </aside>
  );
}
