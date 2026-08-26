import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Join — Pivotum", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#FBFAF6", padding: 24 }}>
      <SignUp />
    </div>
  );
}
