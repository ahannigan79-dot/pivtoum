import Link from "next/link";
import { StarterKitCta } from "@/components/StarterKitCta";
import { SITE } from "@/lib/site";

export function BuyBlock({ source = "index", title }: { source?: string; title?: string }) {
  return (
    <div className="buy">
      <StarterKitCta source={source} title={title} />

      <div className="buy-secondary">
        <h3>Turn the read into your next move — together</h3>
        <p>
          Your Career Map tells you where {title ?? "a career"} stands. <strong>Winning in the Age of AI</strong> is
          how you act on it — your living Career Map re-scored as the field moves, a pod in your exact
          lane, the reps that build your edge, and live events with the founder. The full profile for
          every career that matters to you, plus the community that keeps you moving.
        </p>
        <div className="buy-cta-row">
          <Link className="buy-cta" href={SITE.join}>Start your free trial &rarr;</Link>
          <Link className="buy-cta ghost" href="/community">See everything inside &rarr;</Link>
        </div>
        <p className="fine">Seven days free · cancel anytime · your Map and progress come with you.</p>
      </div>
    </div>
  );
}
