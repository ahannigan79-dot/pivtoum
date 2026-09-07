import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Join — Pivotum", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#F7F9FC", padding: 24 }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 16 }}>
        <SignUp appearance={{ variables: { colorPrimary: "#2F6BFF", borderRadius: "10px" } }} />
        <p style={{ maxWidth: 360, textAlign: "center", fontSize: "0.78rem", lineHeight: 1.5, color: "#6B7280", margin: 0 }}>
          By creating an account you agree to our{" "}
          <Link href="/terms" style={{ color: "#2F6BFF" }}>Terms</Link> and{" "}
          <Link href="/privacy" style={{ color: "#2F6BFF" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
