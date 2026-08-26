/**
 * The Pivotum wordmark — Literata letterforms in brand ink, single-tone (the
 * highlighter is retired). Served from /public/brand so web, samplers and email
 * all use the exact same mark.
 */
export function Wordmark() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="wordmark-logo" src="/brand/pivotum-logo-plain.svg" alt="Pivotum" />;
}
