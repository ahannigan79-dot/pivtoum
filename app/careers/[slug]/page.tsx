import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import { getCareer } from "@/data/careers";
import { careerMdx, samplerSlugs } from "@/content/careers/registry";
import { SITE } from "@/lib/site";
import { CareerHeader } from "@/components/CareerHeader";
import { ScoreBadge } from "@/components/ScoreBadge";
import { QuickAnswer } from "@/components/QuickAnswer";
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

  // Premium blocks are gated: the HTML stays server-rendered (SEO + JSON-LD
  // intact) but is blurred behind the free Career Map. Free/visible: the
  // headline score, QuickAnswer, and VersusGrid — the "high-level review."
  const components: MDXComponents = {
    ScoreTable: () => (
      <>
        <StarterKitCta source={career.slug} title={career.name} />
        <GatedBlur>
          <ScoreTable career={career} />
        </GatedBlur>
      </>
    ),
    FactorList: () => (
      <GatedBlur compact label="The six factors, scored — members">
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
    FaqList: () => <FaqList career={career} />,
    RelatedCareers: () => <RelatedCareers career={career} />,
    FullProfileTable: () => <FullProfileTable career={career} />,
    BuyBlock: () => <BuyBlock source={career.slug} title={career.name} />,
    // Every sampler's single ordered list is the safe-vs-exposed ranking — gate it.
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <GatedBlur compact label="The safe-vs-exposed ranking — members">
        <ol className="ranked" {...props} />
      </GatedBlur>
    ),
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
        <ScoreBadge career={career} />
        <QuickAnswer career={career} />
        <Body components={components} />
        <StarterKitCta source={career.slug} title={career.name} placement="bottom" />
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
