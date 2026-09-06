import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Join — Pivotum", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#F7F9FC", padding: 24 }}>
      <SignUp appearance={{ variables: { colorPrimary: "#2F6BFF", borderRadius: "10px" } }} />
    </div>
  );
}
