import type { Career } from "@/data/careers";
import { renderMarks } from "@/lib/marks";

/** FAQ disclosure rows, rendered from data (same source as the FAQPage JSON-LD). */
export function FaqList({ career }: { career: Career }) {
  return (
    <div className="faq">
      {career.faqs.map((f, i) => (
        <details key={i}>
          <summary>{f.q}</summary>
          <div className="a">{renderMarks(f.a)}</div>
        </details>
      ))}
    </div>
  );
}
