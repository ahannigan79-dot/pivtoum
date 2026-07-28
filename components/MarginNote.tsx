import type { ReactNode } from "react";

/**
 * A pencil-grey margin annotation. Sits in the outer column beside the paragraph
 * it follows in source order; collapses inline with a yellow rule under 62rem.
 * One or two per page.
 */
export function MarginNote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="note">
      <b>{label}</b>
      {children}
    </p>
  );
}
