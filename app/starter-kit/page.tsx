import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/lib/site";

/**
 * The Parent's AI-Proofing Starter Kit — the free lead magnet delivered after a
 * newsletter signup. Deliberately noindex + unlinked from nav: it's the thing you
 * get for subscribing, not a public page. Value sits on the *method/emotional*
 * axis (a test + how to talk to your teen), never the per-kid paid analysis.
 */
export const metadata: Metadata = {
  title: "The Parent's AI-Proofing Starter Kit",
  description:
    "The three-question test to size up any career against AI, how to read the result, and how to raise it with your teenager.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/starter-kit" },
};

export default function StarterKitPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Starter Kit</span>
        </div>

        <p className="kicker" style={{ marginTop: "1rem" }}>
          Your free kit — thanks for subscribing
        </p>
        <h1>The Parent&rsquo;s AI-Proofing Starter Kit</h1>
        <p>
          You can&rsquo;t score every career the way we score twenty-eight of them — six factors,
          three-year trends, sources. But you can get most of the way with three questions. This is
          the test underneath our whole index, stripped to what a parent can use at the dinner table
          on <em>any</em> path your kid names.
        </p>

        <h2>The three-question test</h2>
        <p className="fine">
          Ask these about the actual day-to-day work, not the job title. Each &ldquo;protected&rdquo;
          answer is a point in the career&rsquo;s favour.
        </p>

        <p>
          <strong>1. Is the work unpredictable — or the same steps repeated?</strong> Is every day
          a different situation that has to be read and responded to in the moment (a new patient, a
          new site, a new fault)? Or is it the same procedure run over and over? Repeatable and
          predictable is <em>exposed</em>. Adaptive, different-every-time work is protected —
          that&rsquo;s the single strongest signal there is.
        </p>
        <p>
          <strong>2. Does a human have to be accountable for it?</strong> Does someone need a person
          they can trust and hold responsible — licensed, on the hook when it goes wrong, signing
          their name to the decision? Or is the output just material that feeds someone else&rsquo;s
          call? No accountability is <em>exposed</em>. A license, a signature, or real liability is
          protection AI can&rsquo;t hold.
        </p>
        <p>
          <strong>3. Could the whole thing be done on a screen, as a fixed procedure?</strong> If
          the work can be reduced to steps and run on a screen, it&rsquo;s in the machine&rsquo;s
          strike zone. Screen-able and rule-able is <em>exposed</em>. Work that needs a body in a
          messy, unpredictable place — or judgment that can&rsquo;t be written down — is not.
        </p>

        <h2>Score it, then read it</h2>
        <p>
          <strong>Give the career one point for every &ldquo;protected&rdquo; answer</strong> —
          unpredictable, human-accountable, and can&rsquo;t-be-reduced-to-a-screen.
        </p>
        <ul>
          <li>
            <strong>3 — a real moat.</strong> Among the safest work there is. AI chips at the edges
            (the admin, the paperwork) but not the core.
          </li>
          <li>
            <strong>2 — protected, with a catch.</strong> One exposed answer almost always points to
            a specific weak spot — a track, a specialty, or the entry-level rung. Steer them to the
            protected version of the field, not away from the field.
          </li>
          <li>
            <strong>0–1 — exposed.</strong> The title won&rsquo;t save it. Look hard at what
            they&rsquo;d actually do all day: if it&rsquo;s the repeatable, screen-able,
            no-one-accountable part, the score is telling you something.
          </li>
        </ul>
        <p>
          And the one thing to remember whatever the number:{" "}
          <strong>the line runs through the job title, not around it.</strong> The same profession
          holds a safe path and a doomed one — a trial litigator and a document-review associate are
          both lawyers. So don&rsquo;t ask &ldquo;is medicine safe?&rdquo; Ask &ldquo;which{" "}
          <em>version</em> of it is my kid aiming at?&rdquo;
        </p>

        <h2>How to raise it with your teenager (without a fight)</h2>
        <ul>
          <li>
            <strong>Don&rsquo;t lead with fear.</strong> &ldquo;You&rsquo;ll never get a job&rdquo;
            ends the conversation. &ldquo;Let&rsquo;s pressure-test this together&rdquo; opens it.
          </li>
          <li>
            <strong>Ask, don&rsquo;t tell.</strong> Run the three questions <em>with</em> them on the
            career they love. Teenagers defend a decision they own and dismiss one you hand them.
          </li>
          <li>
            <strong>Point at evidence, not opinion.</strong> &ldquo;Here&rsquo;s how these jobs
            actually scored&rdquo; lands very differently from &ldquo;because I said so.&rdquo;
          </li>
          <li>
            <strong>Aim for the adaptable version.</strong> You&rsquo;re usually not talking them
            <em> out</em> of a field — you&rsquo;re steering them toward the protected path inside it.
          </li>
        </ul>

        <div className="buy" style={{ marginTop: "2.5rem" }}>
          <h2>When you&rsquo;re ready to act, not just check</h2>
          <p>
            The test tells you the shape. <strong>Winning in the Age of AI</strong> is how you act on
            it — the full profile for every career they&rsquo;re weighing, your living Career Map
            re-scored as the field moves, the reps that build real judgment, and a community of people
            navigating the same decision. It&rsquo;s how you make one of your family&rsquo;s biggest
            bets on evidence, not a hunch.
          </p>
          <div className="buy-cta-row">
            <Link className="buy-cta" href={SITE.join}>Start your free trial &rarr;</Link>
            <Link className="buy-cta ghost" href="/community">See everything inside &rarr;</Link>
          </div>
          <p className="fine">
            Know another parent staring down the same decision? Forward them this — they can grab the
            kit at <Link href="/">pivotum.ai</Link>.
          </p>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
