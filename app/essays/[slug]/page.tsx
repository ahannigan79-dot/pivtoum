import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { essayMdx, essaySlugs, getEssay } from "@/content/essays/registry";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamicParams = false;

export function generateStaticParams() {
  return essaySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) return {};
  return {
    title: essay.title,
    description: essay.description,
    alternates: { canonical: `/essays/${essay.slug}` },
    openGraph: {
      title: essay.title,
      description: essay.description,
      type: "article",
      publishedTime: essay.datePublished,
      modifiedTime: essay.dateModified,
      url: `${SITE.url}/essays/${essay.slug}`,
    },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = getEssay(slug);
  const loader = essayMdx[slug];
  if (!essay || !loader) notFound();
  const { default: Essay } = await loader();

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: essay.title,
    description: essay.description,
    datePublished: essay.datePublished,
    dateModified: essay.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/essays/${essay.slug}`,
  };

  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Essays</span>
        </div>
        <Essay />
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
