import type { Metadata } from "next";
import Link from "next/link";
import CS from "@/content/full/computer-science.mdx";
import { getCareer } from "@/data/careers";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";

const career = getCareer("computer-science")!;

export const metadata: Metadata = {
  title: `${career.title} The ${career.edition} Profile`,
  description: career.description,
  alternates: { canonical: "/careers/computer-science" },
  openGraph: {
    title: career.title,
    description: career.description,
    type: "article",
    publishedTime: career.datePublished,
    modifiedTime: career.dateModified,
    url: `${SITE.url}/careers/computer-science`,
  },
};

/**
 * Computer science — the one profile we publish free in full. It uses the
 * long-form full-profile content rather than the sampler template. This static
 * route takes precedence over /careers/[slug].
 */
export default function ComputerSciencePage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: career.title,
    description: career.description,
    datePublished: career.datePublished,
    dateModified: career.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/careers/computer-science`,
  };

  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum Profile</Link>
          </span>
          <i>/</i>
          <span>Computer science</span>
          <i>/</i>
          <span>{career.edition}</span>
        </div>
        <p className="kicker" style={{ marginTop: "1rem" }}>
          The complete profile — published free, in full, so you can judge the depth before
          buying anything.
        </p>
        <CS />
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
