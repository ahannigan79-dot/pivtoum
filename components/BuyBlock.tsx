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
      <h2>Start free: the Parent&rsquo;s AI-Proofing Starter Kit</h2>
      <p className="fine">
        Not buying today? Start here. The three-question test we use to score careers — so you
        can size up any path your kid names — plus how to raise it with your teenager. Free.
      </p>
      <EmailSignup
        flush
        label="Where should we send it?"
        sub="The Starter Kit now, then each new essay and edition of the index. Free, no spam, unsubscribe anytime."
      />

      <div className="buy-secondary">
        <h3>Ready to go deeper?</h3>
        <p className="fine">
          The full six-factor profile for the careers your kid is actually weighing — the
          sub-tracks, the trend, the sources. Most families are choosing between two or three.
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
