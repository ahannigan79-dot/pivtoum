import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — Pivotum", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#141209", padding: 24 }}>
      <SignIn />
    </div>
  );
}
