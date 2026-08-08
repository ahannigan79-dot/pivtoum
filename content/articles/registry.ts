import type { FC } from "react";
import type { MDXComponents } from "mdx/types";

type MDXModule = { default: FC<{ components?: MDXComponents }> };

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

export const articles: ArticleMeta[] = [
  {
    slug: "helping-your-kid-pick-a-career",
    title: "Helping Your Kid Pick a Career Just Got Harder",
    description:
      "We scored every career against AI. The safest ones surprised us — and the pattern behind them changes how to think about choosing a degree.",
    datePublished: "2026-07-01",
    dateModified: "2026-07-29",
  },
];

export const articleMdx: Record<string, () => Promise<MDXModule>> = {
  "helping-your-kid-pick-a-career": () => import("./helping-your-kid-pick-a-career.mdx"),
};

export const articleSlugs = Object.keys(articleMdx);
export function getArticle(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug);
}
