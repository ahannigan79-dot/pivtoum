import { careerCount } from "@/data/careers";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer>
      <p className="footer-creed">{SITE.creed}</p>
      {careerCount} careers, scored the same way. Scores measure exposure to what AI can already
      do &mdash; not how much any particular employer has deployed.
      <br />
      2023 and 2025 figures are reconstructed using current methodology, not archived from past
      editions.
      <br />
      Re-scored every six months. We publish where we might be wrong.
      <br />
      Analysis and scoring judgments are ours. Drafting is AI-assisted &mdash;{" "}
      <a href="/methodology#how-this-is-written">how this is written</a>.
      <br />
      <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refunds">Refunds</a>
    </footer>
  );
}
