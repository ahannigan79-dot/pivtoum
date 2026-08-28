import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import { getCareer } from "@/data/careers";
import { careerMdxStudying } from "@/content/careers/registry";
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
import { SampleVoiceToggle } from "@/components/SampleVoiceToggle";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(careerMdxStudying).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = getCareer(slug);
  if (!career) return {};
  const title = `Should You Study ${career.name}? The ${career.edition} AI Exposure Score`;
  const url = `${SITE.url}/careers/${career.slug}/studying`;
  const description = `${career.name} for students choosing what to study — the AI exposure score, the six factors, and what it means before you commit.`;
  return {
    title,
    description,
    alternates: { canonical: `/careers/${career.slug}/studying` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: career.datePublished,
      modifiedTime: career.dateModified,
    },
  };
}

/**
 * The *studying* voice of a career's free AI Exposure Report — same scores and
 * components as /careers/[slug], framed for someone still choosing what to
 * study rather than someone already in the field. Distinct canonical URL so
 * each version ranks for its own search intent.
 */
export default async function CareerStudyingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = getCareer(slug);
  const loader = careerMdxStudying[slug];
  if (!career || !loader) notFound();

  const { default: Body } = await loader();

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
    OpportunityFlip: () => <OpportunityFlip career={career} voice="studying" />,
    FaqList: () => <FaqList career={career} />,
    RelatedCareers: () => <RelatedCareers career={career} />,
    FullProfileTable: () => <FullProfileTable career={career} />,
    BuyBlock: () => <BuyBlock source={career.slug} title={career.name} />,
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="ranked" {...props} />,
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Should You Study ${career.name}?`,
    description: career.description,
    datePublished: career.datePublished,
    dateModified: career.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/careers/${career.slug}/studying`,
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
        <SampleVoiceToggle slug={career.slug} current="studying" />
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
