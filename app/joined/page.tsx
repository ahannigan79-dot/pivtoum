import Link from "next/link";
import type { Metadata } from "next";
import { MembershipConversion } from "@/components/MembershipConversion";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

/**
 * Public checkout-success page (deliberately NOT under /hub, so the ad pixels
 * load and the member-join conversion can fire). Stripe returns here after a
 * subscription checkout; we fire the conversion, then send the member on to the
 * hub.
 */
export default async function JoinedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100dvh", display: "grid", placeItems: "center",
        background: "#F7F9FC", padding: "24px",
      }}
    >
      <MembershipConversion eventId={session_id} />
      <div
        style={{
          maxWidth: 460, textAlign: "center", background: "#fff",
          border: "1px solid #E2E8F5", borderRadius: 16, padding: "2.4rem 2rem",
          boxShadow: "0 14px 40px rgba(20,40,90,0.08)",
        }}
      >
        <div style={{ fontSize: "1.9rem", lineHeight: 1 }}>🎉</div>
        <h1 style={{ fontSize: "1.6rem", margin: "0.9rem 0 0.5rem", color: "#141B2E" }}>
          You&rsquo;re in.
        </h1>
        <p style={{ color: "#4A5570", lineHeight: 1.6, margin: "0 0 1.6rem" }}>
          Welcome to <b>Winning in the Age of AI</b>. Your membership is live — your Map, your pod,
          and the whole loop are waiting for you inside.
        </p>
        <Link
          href="/hub"
          style={{
            display: "inline-block", background: "#2F6BFF", color: "#fff",
            fontWeight: 600, textDecoration: "none", padding: "0.8rem 1.5rem",
            borderRadius: 10,
          }}
        >
          Enter the community →
        </Link>
      </div>
    </main>
  );
}
