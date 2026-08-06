import Link from "next/link";
import { StarterKitCta } from "@/components/StarterKitCta";

export interface Pack {
  size: number;
  label: string;
  price: string;
  tag?: string;
}

/** The three packs. "5 profiles" is tagged Most families. Pay first, choose after. */
export const PACKS: Pack[] = [
  { size: 1, label: "1 profile", price: "$19" },
  { size: 3, label: "3 profiles", price: "$29" },
  { size: 5, label: "5 profiles", price: "$39", tag: "Most families" },
];

export function BuyBlock({ source = "index", title }: { source?: string; title?: string }) {
  return (
    <div className="buy">
      <StarterKitCta source={source} title={title} />

      <div className="buy-secondary">
        <h3>Choose the degree with your eyes open</h3>
        <p>
          A degree is one of the biggest bets your family will make — years of your kid&rsquo;s life
          and tens of thousands in cost. The full profile is how you make it on evidence, not a
          hunch: all six factors scored and explained, the sub-tracks that split a field in two (the
          specialty that&rsquo;s safe versus the one that isn&rsquo;t), the three-year trend, every
          source, and a version written to your kid. For the two or three careers they&rsquo;re
          seriously weighing, it&rsquo;s the difference between hoping you&rsquo;re right and knowing
          why.
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
          Each includes a short version written directly to the student and the technical
          scoring appendix. Spring 2027 updates of whatever you buy are included.
        </p>
        <p className="fine">
          <Link href="/careers/computer-science">Read one complete profile free &rarr;</Link> We
          publish computer science in full so you can judge the depth before buying anything.
        </p>
      </div>
    </div>
  );
}
