import type { ReactNode } from "react";

/**
 * The signature hand-drawn ellipse around the headline score. One per page.
 * The ellipse draws itself via stroke-dashoffset ~1s after load (see globals.css),
 * and renders complete under prefers-reduced-motion.
 */
export function CircledScore({ children }: { children: ReactNode }) {
  return (
    <span className="circled">
      {children}
      <svg viewBox="0 0 120 62" aria-hidden="true">
        <path d="M96 12C78 3 40 4 22 16 4 28 9 47 30 55c21 8 60 4 74-9 12-11 6-27-16-35-10-4-25-4-34-1" />
      </svg>
    </span>
  );
}
