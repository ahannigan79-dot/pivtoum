import type { FC } from "react";
import type { MDXComponents } from "mdx/types";

type MDXModule = { default: FC<{ components?: MDXComponents }> };

export interface EssayMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

export const essays: EssayMeta[] = [
  {
    slug: "helping-your-kid-pick-a-career",
    title: "Helping Your Kid Pick a Career Just Got Harder",
    description:
      "We scored every career against AI. The safest ones surprised us — and the pattern behind them changes how to think about choosing a degree.",
    datePublished: "2026-07-01",
    dateModified: "2026-07-29",
  },
];

export const essayMdx: Record<string, () => Promise<MDXModule>> = {
  "helping-your-kid-pick-a-career": () => import("./helping-your-kid-pick-a-career.mdx"),
};

export const essaySlugs = Object.keys(essayMdx);
export function getEssay(slug: string): EssayMeta | undefined {
  return essays.find((e) => e.slug === slug);
}
