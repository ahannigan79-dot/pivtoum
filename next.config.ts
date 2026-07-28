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
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkHighlight],
  },
});

export default withMDX(nextConfig);
