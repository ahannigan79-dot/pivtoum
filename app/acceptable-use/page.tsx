import type { Metadata } from "next";
import Link from "next/link";
import AcceptableUse from "@/content/pages/acceptable-use.mdx";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "The community rules for Winning in the Age of AI.",
  alternates: { canonical: "/acceptable-use" },
  robots: { index: true, follow: false },
};

export default function AcceptableUsePage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Acceptable Use</span>
        </div>
        <AcceptableUse />
        <SiteFooter />
      </div>
    </div>
  );
}
