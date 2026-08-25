/* Exposure journey — the member's score plotted across their real milestones:
 * the starting baseline, each personal re-score, and today (with the effort
 * dividend as the final leg). A descending line reads as "coming down". */
export type JourneyPoint = {
  value: number;
  label: string;
  sub?: string;
  kind: "baseline" | "rescore" | "today";
};

export function ExposureJourney({ points }: { points: JourneyPoint[] }) {
  if (points.length < 2) return null;

  const W = 760, H = 232;
  const padX = 52, padTop = 36, padBottom = 56;
  const vals = points.map((p) => p.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(6, max - min);
  min -= span * 0.28; max += span * 0.28;

  const x = (i: number) => padX + (i / (points.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / (max - min)) * (H - padTop - padBottom);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const baseY = H - padBottom;
  const area = `${line} L ${x(points.length - 1).toFixed(1)} ${baseY} L ${x(0).toFixed(1)} ${baseY} Z`;

  return (
    <svg className="ej" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Your exposure journey">
      <defs>
        <linearGradient id="ejfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--prot)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--prot)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* protected/exposed orientation, kept faint */}
      <text x={padX - 8} y={padTop + 4} textAnchor="end" className="ej-axis">Exposed</text>
      <text x={padX - 8} y={baseY} textAnchor="end" className="ej-axis">Protected</text>
      <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="var(--rule)" strokeWidth="1" />
      <path d={area} fill="url(#ejfill)" />
      <path d={line} fill="none" stroke="var(--prot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const today = p.kind === "today";
        return (
          <g key={i}>
            <text x={x(i)} y={y(p.value) - 14} textAnchor="middle" className="ej-val">{p.value}</text>
            {today ? (
              <circle cx={x(i)} cy={y(p.value)} r="6.5" fill="var(--prot)" stroke="var(--panel)" strokeWidth="2.5" />
            ) : (
              <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="var(--ink)" stroke="var(--panel)" strokeWidth="2" />
            )}
            <text x={x(i)} y={baseY + 22} textAnchor="middle" className={"ej-lab" + (today ? " on" : "")}>{p.label}</text>
            {p.sub && <text x={x(i)} y={baseY + 37} textAnchor="middle" className="ej-sub">{p.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
}
