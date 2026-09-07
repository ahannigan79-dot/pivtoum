import type { Metadata } from "next";
import Link from "next/link";
import Refunds from "@/content/pages/refunds.mdx";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Refunds & cancellation",
  description: "How membership cancellation, the free trial, and refunds work for Winning in the Age of AI.",
  alternates: { canonical: "/refunds" },
  robots: { index: true, follow: false },
};

export default function RefundsPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Refunds</span>
        </div>
        <Refunds />
        <SiteFooter />
      </div>
    </div>
  );
}
