import { careerCount } from "@/data/careers";

export function SiteFooter() {
  return (
    <footer>
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
    </footer>
  );
}
