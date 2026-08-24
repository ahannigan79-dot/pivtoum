/* Exposure gauge — where the member sits on the 0–100 scale, with protected →
 * exposed colour zones and a marker. Reads at a glance even with no history. */
export function Gauge({ value }: { value: number }) {
  const W = 300, H = 58, pad = 10, trackY = 34, trackH = 9;
  const v = Math.max(0, Math.min(100, value));
  const x = pad + (v / 100) * (W - pad * 2);

  return (
    <svg className="gauge" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Exposure ${v} of 100`}>
      <defs>
        <linearGradient id="gaugegrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--green)" />
          <stop offset="45%" stopColor="var(--amber)" />
          <stop offset="100%" stopColor="var(--pen)" />
        </linearGradient>
      </defs>
      {/* track */}
      <rect x={pad} y={trackY} width={W - pad * 2} height={trackH} rx={trackH / 2} fill="url(#gaugegrad)" opacity="0.9" />
      {/* marker */}
      <line x1={x} y1={trackY - 7} x2={x} y2={trackY + trackH + 5} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={x} cy={trackY + trackH / 2} r="6.5" fill="var(--ink)" stroke="var(--bg)" strokeWidth="2.5" />
      {/* value label above marker */}
      <text x={x} y={16} textAnchor="middle" className="gauge-val">{v}</text>
      {/* zone labels */}
      <text x={pad} y={H - 2} className="gauge-end">Protected</text>
      <text x={W - pad} y={H - 2} textAnchor="end" className="gauge-end">Exposed</text>
    </svg>
  );
}
