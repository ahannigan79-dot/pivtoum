/** The Pivotum wordmark — Literata swiped through with a yellow highlighter. */
export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-text">Pivotum</span>
      <svg
        className="wordmark-hl"
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 11 L 295 9" strokeWidth="15" strokeLinecap="round" />
      </svg>
    </span>
  );
}
