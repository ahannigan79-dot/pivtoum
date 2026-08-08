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
    slug: "what-im-telling-my-own-kid",
    title: "I build AI for a living. Here's what I'm telling my own kid.",
    description:
      "A founder's honest letter to parents: AI is arriving on top of an already-stacked deck. Here's why it reshapes careers quietly, and the one part of it we still get a say in.",
    datePublished: "2026-08-07",
    dateModified: "2026-08-07",
  },
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
  "what-im-telling-my-own-kid": () => import("./what-im-telling-my-own-kid.mdx"),
  "helping-your-kid-pick-a-career": () => import("./helping-your-kid-pick-a-career.mdx"),
};

export const articleSlugs = Object.keys(articleMdx);
export function getArticle(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug);
}
