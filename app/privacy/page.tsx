import type { Metadata } from "next";
import Link from "next/link";
import Privacy from "@/content/pages/privacy.mdx";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What data Pivotum collects, why, and how to have it removed.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Privacy</span>
        </div>
        <Privacy />
        <SiteFooter />
      </div>
    </div>
  );
}
