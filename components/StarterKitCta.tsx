import { EmailSignup } from "@/components/EmailSignup";

/**
 * Inline "email me the PDF" capture, placed above the score tables (homepage
 * index and every sampler). On a sampler it offers that career's write-up as a
 * PDF; on the index it offers all 28 scores. A distinct tinted box so it reads
 * as an offer, not prose.
 */
export function StarterKitCta({ source = "index", title }: { source?: string; title?: string }) {
  const isSampler = source !== "index" && Boolean(title);
  return (
    <aside className="kit-cta">
      <p className="kit-cta-lead">
        <span className="kit-cta-flag">Free PDF</span>
        {isSampler ? (
          <>
            <strong>Email me the {title} write-up</strong> — the full sampler as a PDF to keep,
            print, and talk through with your partner.
          </>
        ) : (
          <>
            <strong>Email me all 28 scores</strong> — the whole index as a one-page PDF, safest to
            most exposed.
          </>
        )}
      </p>
      <EmailSignup flush source={source} sub="" label="Where should we send it?" cta="Email me the PDF" />
    </aside>
  );
}
