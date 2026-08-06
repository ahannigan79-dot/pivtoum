import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

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

        <h3>1. Is the work unpredictable — or the same steps repeated?</h3>
        <p>
          Is every day a different situation that has to be read and responded to in the moment
          (a new patient, a new site, a new fault)? Or is it the same procedure run over and over?
          <strong> Repeatable and predictable is exposed.</strong> Adaptive, different-every-time
          work is protected — that&rsquo;s the single strongest signal there is.
        </p>

        <h3>2. Does a human have to be accountable for it?</h3>
        <p>
          Does someone need a person they can <em>trust and hold responsible</em> — licensed, on
          the hook when it goes wrong, signing their name to the decision? Or is the output just
          material that feeds someone else&rsquo;s call? <strong>No accountability is exposed.</strong>{" "}
          A licence, a signature, or real liability is protection AI can&rsquo;t hold.
        </p>

        <h3>3. Could the whole thing be done on a screen, as a fixed procedure?</h3>
        <p>
          If the work can be reduced to steps and run on a screen, it&rsquo;s in the machine&rsquo;s
          strike zone. <strong>Screen-able and rule-able is exposed.</strong> Work that needs a body
          in a messy, unpredictable place — or judgment that can&rsquo;t be written down — is not.
        </p>

        <h2>How to read the result</h2>
        <p>
          Mostly &ldquo;protected&rdquo; answers means the work has a real moat. Mostly the other way
          means it&rsquo;s exposed — <em>no matter how prestigious the title sounds.</em> The one
          thing to remember: <strong>the line runs through the job title, not around it.</strong> The
          same profession can hold a safe path and a doomed one — a trial litigator and a
          document-review associate are both lawyers. So don&rsquo;t ask &ldquo;is medicine safe?&rdquo;
          Ask &ldquo;which <em>version</em> of it is my kid aiming at?&rdquo;
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
          <h2>When you&rsquo;re ready to go past three questions</h2>
          <p>
            The test tells you the shape. The full profiles give you the whole picture for the
            careers your kid is <em>actually</em> weighing — all six factors, the sub-tracks that
            split a field in two, the three-year trend, and the sources behind every number.
          </p>
          <p className="fine">
            <Link href="/careers/computer-science">Read one complete profile free &rarr;</Link>{" "}
            then <Link href="/buy">pick a pack for your kid&rsquo;s shortlist &rarr;</Link>
          </p>
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
