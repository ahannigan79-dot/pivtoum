import Link from "next/link";
import { EmailSignup } from "@/components/EmailSignup";

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

export function BuyBlock() {
  return (
    <div className="buy">
      <h2>Get the full profiles</h2>
      <p className="fine">
        Most families are weighing two or three careers seriously, and a few more they
        haven&rsquo;t ruled out. Pick the ones you need.
      </p>
      <div className="tiers">
        {PACKS.map((p) => (
          <Link key={p.size} className={`tier${p.tag ? " best" : ""}`} href={`/buy?pack=${p.size}`}>
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
      <EmailSignup
        label="Not ready for the full profiles yet?"
        sub="We re-score every career every six months and publish what moved. Get the next edition — and the essays — free."
        cta="Keep me posted"
        done="You’re on the list. We’ll email you when the scores move."
      />
    </div>
  );
}
