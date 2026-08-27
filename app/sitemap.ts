import type { MetadataRoute } from "next";
import { getCareer } from "@/data/careers";
import { samplerSlugs } from "@/content/careers/registry";
import { articles } from "@/content/articles/registry";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  const careerPages = [...samplerSlugs, "computer-science"].map((slug) => ({
    url: `${base}/careers/${slug}`,
    lastModified: getCareer(slug)?.dateModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articlePages = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.dateModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/community`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/careers/computer-science/student`, changeFrequency: "monthly", priority: 0.7 },
    ...careerPages,
    ...articlePages,
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refunds`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
