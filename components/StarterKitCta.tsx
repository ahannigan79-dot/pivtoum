import Link from "next/link";

/**
 * Homepage-route entry point into the Career Map. Placed above the score tables
 * (homepage index and every sampler) and again lower down. Rather than capture
 * an email inline for a single PDF, it routes everyone to /map so every lead is
 * captured the same way — stage + who + the careers that matter — and lands in
 * the matching package + nurture flow. A sampler seeds its own career into the
 * map via ?career=<slug>. A quieter secondary link keeps the direct-buy path
 * open for anyone ready to decide now.
 */
export function StarterKitCta({
  source = "index",
  title,
  placement = "top",
}: {
  source?: string;
  title?: string;
  placement?: "top" | "bottom";
}) {
  const isSampler = source !== "index" && Boolean(title);
  const bottom = placement === "bottom";
  const mapHref = isSampler ? `/map?career=${encodeURIComponent(source)}` : "/map";
  return (
    <aside className="kit-cta">
      <p className="kit-cta-lead">
        <span className="kit-cta-flag">Free</span>
        {isSampler ? (
          bottom ? (
            <>
              <strong>Read this far? Take {title} with you.</strong> Build your free Career Map —
              this read, all 28 careers scored, and a short guide for exactly where you stand. Yours
              to keep, print, and talk through with your family.
            </>
          ) : (
            <>
              <strong>Want {title} to keep — and the rest?</strong> Build your free Career Map: this
              read, all 28 careers scored, and a short guide written for exactly where you stand.
            </>
          )
        ) : (
          <>
            <strong>Build your free Career Map</strong> — all 28 careers scored, a short guide
            written for exactly where you stand, and the full read on the careers that matter most
            to you. Yours to keep, print, and share.
          </>
        )}
      </p>
      <div className="kit-cta-actions">
        <Link className="kit-cta-btn" href={mapHref}>
          Build my free Career Map &rarr;
        </Link>
        <Link className="kit-cta-buy" href="/community">
          or see everything inside the community &rarr;
        </Link>
      </div>
    </aside>
  );
}
