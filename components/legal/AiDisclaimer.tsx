import Link from "next/link";

/**
 * "Not professional advice" notice for AI-generated hub output (Map readings,
 * Workflow Rebuilds, Judgment Gym) and the public share pages. `full` is the
 * block used on public/shareable surfaces; `compact` is the inline one-liner
 * for inside the hub.
 */
export function AiDisclaimer({ variant = "compact" }: { variant?: "compact" | "full" }) {
  if (variant === "full") {
    return (
      <aside
        style={{
          margin: "1.25rem 0 0", padding: "0.9rem 1rem", borderRadius: 10,
          background: "#F4F6FB", border: "1px solid #E2E8F5",
          fontSize: "0.82rem", lineHeight: 1.55, color: "#4A5570",
        }}
      >
        <b style={{ color: "#2A3350" }}>A note on this document.</b> It was generated with AI from
        information a member provided, using Pivotum&rsquo;s frameworks. AI output can be wrong or out
        of date — treat it as a draft to verify, not professional (career, legal, financial, or tax)
        advice, and check anything before you act on it. See our{" "}
        <Link href="/terms" style={{ color: "#2F6BFF" }}>Terms</Link>.
      </aside>
    );
  }
  return (
    <p
      style={{
        margin: "0.9rem 0 0", fontSize: "0.76rem", lineHeight: 1.5, color: "#8A93A3",
      }}
    >
      AI-generated — a draft to verify, not professional advice. Check anything before you act on it.{" "}
      <Link href="/terms" style={{ color: "#2F6BFF" }}>Terms</Link>.
    </p>
  );
}
