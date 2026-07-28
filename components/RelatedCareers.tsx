import Link from "next/link";
import type { Career } from "@/data/careers";
import { getCareer, careerRange } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";

function rangeLabel(c: Career): string {
  const { safest, exposed } = careerRange(c);
  return safest === exposed ? safest.toFixed(1) : `${safest.toFixed(1)}–${exposed.toFixed(1)}`;
}

/**
 * Related profiles with live scores computed from the target career's data —
 * never hand-written, so they can't go stale on the six-month refresh.
 * Careers whose page isn't built yet render as plain (unlinked) rows.
 */
export function RelatedCareers({ career }: { career: Career }) {
  return (
    <div className="rel">
      {career.related.map((slug) => {
        const target = getCareer(slug);
        if (!target) return null;
        const suffix =
          slug === "computer-science" ? ` · free to read in full` : "";
        const inner = (
          <>
            <span>{target.name}</span>
            <span className="s">
              {rangeLabel(target)}
              {suffix}
            </span>
          </>
        );
        return hasSamplerPage(slug) ? (
          <Link key={slug} href={`/careers/${slug}`}>
            {inner}
          </Link>
        ) : (
          <a key={slug} aria-disabled="true">
            {inner}
          </a>
        );
      })}
    </div>
  );
}
