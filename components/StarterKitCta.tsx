import { EmailSignup } from "@/components/EmailSignup";

/**
 * Inline "get the free Starter Kit" capture, placed at high-interest points —
 * above the score table on the homepage index and on every sampler. A distinct
 * tinted box so it reads as an offer, not part of the surrounding prose.
 */
export function StarterKitCta() {
  return (
    <aside className="kit-cta">
      <p className="kit-cta-lead">
        <span className="kit-cta-flag">Free kit</span>
        <strong>The Parent&rsquo;s AI-Proofing Starter Kit</strong> — the three-question test to size
        up any career your kid names, and how to raise it with them.
      </p>
      <EmailSignup flush sub="" label="Where should we send it?" cta="Send me the kit" />
    </aside>
  );
}
