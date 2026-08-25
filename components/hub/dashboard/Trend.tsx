import type { TrajectoryPoint } from "@/lib/trajectory";

/* Exposure trajectory sparkline. Lower is better, so a falling line is progress.
 * Pure inline SVG — themes via currentColor / tokens. */
export function Trend({ points, className }: { points: TrajectoryPoint[]; className?: string }) {
  const W = 260, H = 64, pad = 8;
  if (points.length === 0) return null;

  // Fixed 0–100 exposure scale so re-scores are comparable across editions.
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => pad + ((100 - v) / 100) * (H - pad * 2); // invert: low exposure = high on chart = good

  if (points.length === 1) {
    const cx = W / 2, cy = y(points[0].overall);
    return (
      <svg className={className} viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="First reading">
        <circle cx={cx} cy={cy} r="4.5" fill="var(--prot)" />
        <circle cx={cx} cy={cy} r="9" fill="none" stroke="var(--prot)" strokeWidth="1.5" opacity="0.5" />
      </svg>
    );
  }

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.overall).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;
  const lastX = x(points.length - 1), lastY = y(points[points.length - 1].overall);
  const first = points[0].overall, last = points[points.length - 1].overall;
  const improving = last <= first; // exposure down or flat = good
  const stroke = improving ? "var(--prot)" : "var(--pen)";

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
      aria-label={`Exposure trend from ${first} to ${last}`}>
      <defs>
        <linearGradient id="trendfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendfill)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={stroke} />
    </svg>
  );
}
