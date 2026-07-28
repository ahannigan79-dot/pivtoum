import type { Metadata } from "next";
import Link from "next/link";
import Methodology from "@/content/pages/methodology.mdx";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How We Score — The Methodology",
  description:
    "How Pivotum scores every career for AI exposure: the same six factors, the same fixed weights, applied identically across careers. A score you can interrogate.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Methodology</span>
        </div>
        <Methodology />
        <SiteFooter />
      </div>
    </div>
  );
}
