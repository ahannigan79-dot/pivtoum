import type { FC } from "react";
import type { MDXComponents } from "mdx/types";

type MDXModule = { default: FC<{ components?: MDXComponents }> };

/**
 * Maps a career slug to its sampler MDX body. Static imports so every page is
 * statically generated at build. Add a career here when its .mdx is ready.
 */
export const careerMdx: Record<string, () => Promise<MDXModule>> = {
  nursing: () => import("./nursing.mdx"),
};

export const samplerSlugs = Object.keys(careerMdx);

export function hasSamplerPage(slug: string): boolean {
  return slug in careerMdx;
}
