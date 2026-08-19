/**
 * Content gate. Keeps the server-rendered HTML in the DOM — so Googlebot still
 * reads the score table, factors and reasoning, and the Article / FAQ structured
 * data is unaffected — while visually blurring it for human visitors and
 * offering the free Career Map to unlock it. This is a metered-content pattern,
 * not cloaking: Google and people are served the identical HTML; only CSS
 * obscures it.
 *
 * Server component — no client JS. The blurred content is aria-hidden and
 * non-interactive; the veil carries the call to action.
 */
export function GatedBlur({
  children,
  label = "Members read the rest",
  cta = "The full breakdown — every sub-track score, the six factors, and the safe-vs-exposed split — unlocks free with your Career Map.",
  compact = false,
}: {
  children: React.ReactNode;
  label?: string;
  cta?: string;
  compact?: boolean;
}) {
  return (
    <div className={`gated${compact ? " gated-compact" : ""}`}>
      <div className="gated-content" aria-hidden="true">
        {children}
      </div>
      <div className="gated-veil">
        <div className="gated-card">
          <p className="gated-k">🔒 {label}</p>
          {!compact ? <p className="gated-t">{cta}</p> : null}
          <a className="gated-go" href="/map">
            Get the free Career Map →
          </a>
        </div>
      </div>
    </div>
  );
}
