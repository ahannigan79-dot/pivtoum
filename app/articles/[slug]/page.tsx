import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleMdx, articleSlugs, getArticle } from "@/content/articles/registry";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { EmailSignup } from "@/components/EmailSignup";
import { PageView } from "@/components/PageView";
import { Takeaway } from "@/components/Takeaway";

export const dynamicParams = false;

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const ogImages = article.ogImage
    ? [{ url: article.ogImage, width: 1200, height: 630, alt: article.title }]
    : undefined;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      url: `${SITE.url}/articles/${article.slug}`,
      images: ogImages,
    },
    twitter: {
      card: ogImages ? "summary_large_image" : "summary",
      title: article.title,
      description: article.description,
      images: ogImages?.map((i) => i.url),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  const loader = articleMdx[slug];
  if (!article || !loader) notFound();
  const { default: Article } = await loader();

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/articles/${article.slug}`,
  };

  return (
    <div className="page">
      <div className="body">
        <PageView event="article_view" />
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Articles</span>
        </div>
        <Article components={{ Takeaway }} />
        <EmailSignup />
        <SiteFooter />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
