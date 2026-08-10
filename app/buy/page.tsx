import type { Metadata } from "next";
import Link from "next/link";
import { BuyPacks } from "@/components/BuyPacks";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "Get the Career Value Guide",
  description:
    "Buy the full Pivotum Career Value Guide by the career — 1, 3, or unlimited. Pay first, then choose which careers you want. Every future edition included.",
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
          <span>Get the Career Value Guide</span>
        </div>

        <h1>Get the Career Value Guide</h1>
        <p className="kicker">
          The score tells you where a career stands. The Career Value Guide is how you act on it —
          whether your kid is still choosing a path or already on one, backed by evidence, not a
          hunch.
        </p>
        <p>
          Each Career Value Guide gives you all six factors scored and explained, the sub-tracks that
          split a field in two (the specialty that&rsquo;s safe versus the one that isn&rsquo;t), the
          three-year trend so you know which way it&rsquo;s moving, every source behind the numbers,
          and a version written directly to the student. Most families weigh two or three careers
          seriously. Pick a pack; choose which careers after checkout.
        </p>

        <BuyPacks />

        <p className="fine">
          Each includes a short version written directly to the student and the technical scoring
          appendix. Every future edition of what you buy is included, free — we re-score every six
          months.
        </p>
        <p className="fine">
          <Link href="/careers/computer-science">See a complete Career Value Guide free &rarr;</Link>{" "}
          We publish computer science in full so you can judge the depth before buying anything.
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
