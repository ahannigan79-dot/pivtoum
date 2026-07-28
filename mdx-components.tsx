import type { MDXComponents } from "mdx/types";
import { CareerCount } from "@/components/CareerCount";

/**
 * Global MDX element defaults. The design system is driven by element selectors
 * in globals.css, so most elements need no mapping here. Career pages pass
 * data-bound components (ScoreTable, FactorList, …) at render time.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { CareerCount, ...components };
}
