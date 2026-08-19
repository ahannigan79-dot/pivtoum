import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkHighlight from "./lib/remark-highlight";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Bundle the committed profile PDFs into the upload route so it can read them
  // at runtime and push them to Blob.
  outputFileTracingIncludes: {
    "/api/upload-profiles": ["./profiles-src/**"],
    "/api/upload-samplers": ["./samplers-src/**"],
  },
  // The essays section was renamed to /articles — 301 the old URLs so the
  // one indexed piece keeps its SEO and any external links don't 404.
  async redirects() {
    return [
      { source: "/essays/:slug*", destination: "/articles/:slug*", permanent: true },
      // /scores was a second ad-landing page; all paid traffic now goes to /map.
      // 301 so no spend or SEO leaks to the retired page.
      { source: "/scores", destination: "/map", permanent: true },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkHighlight],
  },
});

export default withMDX(nextConfig);
