import type { Metadata } from "next";
import Link from "next/link";
import { PACKS } from "@/lib/packs";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Get the full profiles",
  description:
    "Buy full Pivotum career profiles in packs of 1, 3 or 5. Pay first, then choose which profiles you want. Spring 2027 updates included.",
  alternates: { canonical: "/buy" },
};

export default function BuyPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Get the full profiles</span>
        </div>

        <h1>Get the full profiles</h1>
        <p className="kicker">
          Most families are weighing two or three careers seriously, and a few more they
          haven&rsquo;t ruled out. Pick a pack — you choose which profiles after checkout.
        </p>

        <div className="tiers">
          {PACKS.map((p) => (
            <form key={p.size} action="/api/checkout" method="post">
              <input type="hidden" name="pack" value={p.size} />
              <button type="submit" className={`tier${p.tag ? " best" : ""}`}>
                <span className="n">{p.label}</span>
                {p.tag ? <span className="tag">{p.tag}</span> : null}
                <span className="p">{p.price}</span>
              </button>
            </form>
          ))}
        </div>

        <p className="fine">
          Each includes a short version written directly to the student and the technical scoring
          appendix. Spring 2027 updates of whatever you buy are included.
        </p>
        <p className="fine">
          <Link href="/careers/computer-science">Read one complete profile free &rarr;</Link> We
          publish computer science in full so you can judge the depth before buying anything.
        </p>

        <SiteFooter />
      </div>
    </div>
  );
}
