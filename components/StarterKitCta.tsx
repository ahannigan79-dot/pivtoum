import { EmailSignup } from "@/components/EmailSignup";

/**
 * Inline "email me the PDF" capture, placed above the score tables (homepage
 * index and every sampler). On a sampler it offers that career's write-up as a
 * PDF; on the index it offers all 28 scores. A distinct tinted box so it reads
 * as an offer, not prose.
 */
export function StarterKitCta({
  source = "index",
  title,
  placement = "top",
}: {
  source?: string;
  title?: string;
  placement?: "top" | "bottom";
}) {
  const isSampler = source !== "index" && Boolean(title);
  const bottom = placement === "bottom";
  return (
    <aside className="kit-cta">
      <p className="kit-cta-lead">
        <span className="kit-cta-flag">Free PDF</span>
        {isSampler ? (
          bottom ? (
            <>
              <strong>Read this far? Take {title} with you.</strong> Email yourself the full sampler
              as a PDF — plus the other 27 careers scored — to keep, print, and talk through with
              your family.
            </>
          ) : (
            <>
              <strong>Email me the {title} write-up</strong> — the full sampler as a PDF to keep,
              print, and talk through with your family.
            </>
          )
        ) : (
          <>
            <strong>Email me the full 28-career index</strong> — a PDF that goes beyond the table: a
            plain-English read on every score (where each career is safe, where it&rsquo;s exposed)
            and the thinking behind the numbers. Yours to keep, print and share.
          </>
        )}
      </p>
      <EmailSignup flush source={source} sub="" label="Where should we send it?" cta="Email me the PDF" />
    </aside>
  );
}
