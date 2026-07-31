/**
 * The Pivotum wordmark — the committed brand logo (Literata with the bright
 * hand-drawn highlighter). Served from /public/brand so web, samplers and email
 * all use the exact same mark.
 */
export function Wordmark() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="wordmark-logo" src="/brand/pivotum-logo-tight.svg" alt="Pivotum" />;
}
