import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pivotum — Helping parents navigate AI and their kids' careers",
  description:
    "Pivotum helps parents understand how artificial intelligence is reshaping the careers their children will step into — and how to guide them.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
