import type { ReactNode } from "react";

/**
 * The inline headline score — single-tone, the numeral carries the emphasis in
 * the brand ink/exposure palette (the hand-drawn ellipse is retired).
 */
export function CircledScore({ children }: { children: ReactNode }) {
  return <span className="circled">{children}</span>;
}
