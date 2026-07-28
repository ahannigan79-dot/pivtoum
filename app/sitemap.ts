import type { MetadataRoute } from "next";
import { getCareer } from "@/data/careers";
import { samplerSlugs } from "@/content/careers/registry";
import { essays } from "@/content/essays/registry";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  const careerPages = [...samplerSlugs, "computer-science"].map((slug) => ({
    url: `${base}/careers/${slug}`,
    lastModified: getCareer(slug)?.dateModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const essayPages = essays.map((e) => ({
    url: `${base}/essays/${e.slug}`,
    lastModified: e.dateModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    ...careerPages,
    ...essayPages,
  ];
}
