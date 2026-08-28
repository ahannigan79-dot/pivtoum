import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import { getCareer } from "@/data/careers";
import { careerMdx, samplerSlugs, hasStudyingVersion } from "@/content/careers/registry";
import { SampleVoiceToggle } from "@/components/SampleVoiceToggle";
import { SITE } from "@/lib/site";
import { CareerHeader } from "@/components/CareerHeader";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreTable } from "@/components/ScoreTable";
import { FactorList } from "@/components/FactorList";
import { WorkedExample } from "@/components/WorkedExample";
import { MarginNote } from "@/components/MarginNote";
import { VersusGrid } from "@/components/VersusGrid";
import { FaqList } from "@/components/FaqList";
import { RelatedCareers } from "@/components/RelatedCareers";
import { FullProfileTable } from "@/components/FullProfileTable";
import { GatedBlur } from "@/components/GatedBlur";
import { BuyBlock } from "@/components/BuyBlock";
import { OpportunityFlip } from "@/components/OpportunityFlip";
import { SiteFooter } from "@/components/SiteFooter";
import { PageView } from "@/components/PageView";
import { StarterKitCta } from "@/components/StarterKitCta";

export const dynamicParams = false;

export function generateStaticParams() {
  return samplerSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = getCareer(slug);
  if (!career) return {};
  const title = `${career.title} The ${career.edition} Degree Risk Score`;
  const url = `${SITE.url}/careers/${career.slug}`;
  return {
    title,
    description: career.description,
    alternates: { canonical: `/careers/${career.slug}` },
    openGraph: {
      title,
      description: career.description,
      url,
      type: "article",
      publishedTime: career.datePublished,
      modifiedTime: career.dateModified,
    },
  };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = getCareer(slug);
  const loader = careerMdx[slug];
  if (!career || !loader) notFound();

  const { default: Body } = await loader();

  // The AI Exposure Report reveals where you stand — the lane scores and the
  // safe-vs-exposed ranking are free (they add value and build trust). What's
  // gated is the *methodology and the depth*: the six factors behind the number
  // and the full reasoning. The gated HTML still server-renders for SEO.
  const components: MDXComponents = {
    ScoreTable: () => (
      <>
        <StarterKitCta source={career.slug} title={career.name} />
        <ScoreTable career={career} />
      </>
    ),
    FactorList: () => (
      <GatedBlur compact label="The six factors behind your number — members">
        <FactorList career={career} />
      </GatedBlur>
    ),
    WorkedExample: ({ children }: { children?: React.ReactNode }) => (
      <GatedBlur compact label="The full reasoning — members">
        <WorkedExample career={career}>{children}</WorkedExample>
      </GatedBlur>
    ),
    MarginNote: MarginNote as MDXComponents[string],
    VersusGrid: VersusGrid as MDXComponents[string],
    OpportunityFlip: () => <OpportunityFlip career={career} voice="career" />,
    FaqList: () => <FaqList career={career} />,
    RelatedCareers: () => <RelatedCareers career={career} />,
    FullProfileTable: () => <FullProfileTable career={career} />,
    BuyBlock: () => <BuyBlock source={career.slug} title={career.name} />,
    // The single ordered list is the safe-vs-exposed ranking — free, part of the read.
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="ranked" {...props} />,
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: career.title,
    description: career.description,
    datePublished: career.datePublished,
    dateModified: career.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/careers/${career.slug}`,
  };

  const faqLd =
    career.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: career.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a.replace(/==[+\-?]?|==/g, ""),
            },
          })),
        }
      : null;

  return (
    <div className="page">
      <div className="body">
        <PageView event="sampler_view" />
        <CareerHeader career={career} />
        {hasStudyingVersion(career.slug) && <SampleVoiceToggle slug={career.slug} current="career" />}
        <ScoreBadge career={career} />
        <Body components={components} />
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
    </div>
  );
}
