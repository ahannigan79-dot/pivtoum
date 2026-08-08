import type { ReactNode } from "react";

/**
 * Recurring "The takeaway" callout used between sections of an article —
 * a distilled, memorable point a parent can carry away. Passed into the MDX
 * article via its `components` prop so it can be used as <Takeaway>…</Takeaway>.
 */
export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <aside className="takeaway">
      <span className="takeaway-label">The takeaway</span>
      <p className="takeaway-body">{children}</p>
    </aside>
  );
}
