import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import { getCareer } from "@/data/careers";
import { careerMdx, samplerSlugs } from "@/content/careers/registry";
import { SITE } from "@/lib/site";
import { CareerHeader } from "@/components/CareerHeader";
import { QuickAnswer } from "@/components/QuickAnswer";
import { ScoreTable } from "@/components/ScoreTable";
import { FactorList } from "@/components/FactorList";
import { WorkedExample } from "@/components/WorkedExample";
import { MarginNote } from "@/components/MarginNote";
import { VersusGrid } from "@/components/VersusGrid";
import { FaqList } from "@/components/FaqList";
import { RelatedCareers } from "@/components/RelatedCareers";
import { FullProfileTable } from "@/components/FullProfileTable";
import { BuyBlock } from "@/components/BuyBlock";
import { SiteFooter } from "@/components/SiteFooter";

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

  const components: MDXComponents = {
    ScoreTable: () => <ScoreTable career={career} />,
    FactorList: () => <FactorList career={career} />,
    WorkedExample: ({ children }: { children?: React.ReactNode }) => (
      <WorkedExample career={career}>{children}</WorkedExample>
    ),
    MarginNote: MarginNote as MDXComponents[string],
    VersusGrid: VersusGrid as MDXComponents[string],
    FaqList: () => <FaqList career={career} />,
    RelatedCareers: () => <RelatedCareers career={career} />,
    FullProfileTable: () => <FullProfileTable career={career} />,
    BuyBlock: () => <BuyBlock />,
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
        <CareerHeader career={career} />
        <QuickAnswer career={career} />
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
