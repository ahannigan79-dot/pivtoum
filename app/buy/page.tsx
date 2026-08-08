import type { Metadata } from "next";
import Link from "next/link";
import { BuyPacks } from "@/components/BuyPacks";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";

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
          The score tells you where a career stands. The full profile is how you actually choose —
          so you&rsquo;re backing the best possible path for your kid on evidence, not a hunch.
        </p>
        <p>
          Each profile gives you all six factors scored and explained, the sub-tracks that split a
          field in two (the specialty that&rsquo;s safe versus the one that isn&rsquo;t), the
          three-year trend so you know which way it&rsquo;s moving, every source behind the numbers,
          and a version written directly to your kid. A degree is one of the biggest bets your family
          will make — most families weigh two or three careers seriously. Pick a pack; choose which
          profiles after checkout.
        </p>

        <BuyPacks />

        <p className="fine">
          Each includes a short version written directly to the student and the technical scoring
          appendix. Spring 2027 updates of whatever you buy are included.
        </p>
        <p className="fine">
          <Link href="/careers/computer-science">Read one complete profile free &rarr;</Link> We
          publish computer science in full so you can judge the depth before buying anything.
        </p>

        <EmailSignup
          label="Not ready to buy? Start free."
          sub="Grab the Parent’s AI-Proofing Starter Kit — the three-question test — plus each new article and edition. Free, no spam."
        />

        <SiteFooter />
      </div>
    </div>
  );
}
