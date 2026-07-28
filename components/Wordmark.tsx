/** The Pivotum wordmark — Literata swept through with a hand-drawn highlighter squiggle. */
export function Wordmark() {
  return (
    <span className="wordmark">
      <svg
        className="wordmark-hl"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3 13 C 40 4 72 21 110 12 C 148 4 186 21 224 12 C 258 5 284 18 297 12"
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="wordmark-text">Pivotum</span>
    </span>
  );
}
