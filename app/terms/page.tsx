import type { Metadata } from "next";
import Link from "next/link";
import Terms from "@/content/pages/terms.mdx";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of sale and use for Pivotum and the AI Career Index.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
};

export default function TermsPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Terms</span>
        </div>
        <Terms />
        <SiteFooter />
      </div>
    </div>
  );
}
