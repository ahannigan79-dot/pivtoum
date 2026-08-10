import Link from "next/link";
import { StarterKitCta } from "@/components/StarterKitCta";
import { PACKS } from "@/lib/packs";

export function BuyBlock({ source = "index", title }: { source?: string; title?: string }) {
  return (
    <div className="buy">
      <StarterKitCta source={source} title={title} />

      <div className="buy-secondary">
        <h3>Go deeper with the Career Value Guide</h3>
        <p>
          The free read tells you where a career stands. The <strong>Career Value Guide</strong> is
          how you act on it — whether your kid is still choosing a path or already on one. All six
          factors scored and explained, the sub-tracks that split a field in two (the specialty
          that&rsquo;s safe versus the one that isn&rsquo;t), the three-year trend, every source, and
          a version written directly to the student. For the two or three careers that matter most to
          your family, it&rsquo;s the difference between hoping you&rsquo;re right and knowing why.
        </p>
        <div className="tiers">
          {PACKS.map((p) => (
            <Link
              key={p.size}
              className={`tier${p.tag ? " best" : ""}`}
              href={`/buy?pack=${p.size}`}
            >
              <span className="n">{p.label}</span>
              {p.tag ? <span className="tag">{p.tag}</span> : null}
              <span className="p">{p.price}</span>
            </Link>
          ))}
        </div>
        <p className="fine">
          Each Career Value Guide includes a version written directly to the student and the
          technical scoring appendix. This edition and the next are included, free — a full year
          current.
        </p>
        <p className="fine">
          <Link href="/careers/computer-science">See a complete Career Value Guide free &rarr;</Link>{" "}
          We publish computer science in full so you can judge the depth before buying anything.
        </p>
      </div>
    </div>
  );
}
