import type { Metadata } from "next";
import Link from "next/link";
import CS from "@/content/full/computer-science.mdx";
import { getCareer } from "@/data/careers";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { GatedBlur } from "@/components/GatedBlur";
import { OpportunityFlip } from "@/components/OpportunityFlip";
import { EmailSignup } from "@/components/EmailSignup";

const career = getCareer("computer-science")!;

export const metadata: Metadata = {
  title: `${career.title} The ${career.edition} AI Exposure Report`,
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
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Computer science</span>
          <i>/</i>
          <span>{career.edition}</span>
        </div>
        <p className="kicker" style={{ marginTop: "1rem" }}>
          The complete Computer Science AI Exposure Report — published free, in full, so you can see
          the depth behind every score. Every other career&rsquo;s full breakdown opens inside the
          community.
        </p>
        <GatedBlur
          label="The complete Computer Science breakdown"
          cta="The full read — every sub-track scored and explained. This one's here in full so you can judge the depth; every other career's breakdown is inside the community."
        >
          <CS />
        </GatedBlur>
        <OpportunityFlip career={career} voice="career" />
        <EmailSignup
          label="Want the test behind these scores?"
          sub="Grab the free Starter Kit — the three-question test to size up any career you're weighing — plus each new article and edition. Free, no spam."
        />
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
