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
              <strong>This is the read on {title}. Now get your own.</strong> Your free AI Exposure Report
              scores your exact situation, lays all 28 careers side by side, and names your next
              move — emailed, yours to keep.
            </>
          ) : (
            <>
              <strong>This is the read on {title}. Get yours, scored for you.</strong> Your free AI
              Exposure Report: your exposure for your exact situation, all 28 careers side by side,
              and your next move.
            </>
          )
        ) : (
          <>
            <strong>Build your free AI Exposure Report</strong> — all 28 careers scored, a short guide
            written for exactly where you stand, and the full read on the careers that matter most
            to you. Yours to keep, print, and share.
          </>
        )}
      </p>
      <div className="kit-cta-actions">
        <Link className="kit-cta-btn" href={mapHref}>
          Build my free AI Exposure Report &rarr;
        </Link>
        <Link className="kit-cta-buy" href="/community">
          or see everything inside the community &rarr;
        </Link>
      </div>
    </aside>
  );
}
