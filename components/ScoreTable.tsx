import type { Band, Career, Track } from "@/data/careers";
import { nowScore } from "@/data/careers";

const BAND_LABEL: Record<Band, string> = {
  "very-low": "Very low",
  low: "Low",
  "low-mod": "Low–Mod",
  moderate: "Moderate",
  "mod-high": "Mod–High",
  high: "High",
};

function move(t: Track): string {
  const d = t.scores["2026"] - t.scores["2023"];
  return (d >= 0 ? "+" : "") + d.toFixed(1);
}

/**
 * The score table, rendered from data. The highest 'now' row is tinted yellow
 * (top), the lowest green (low) — marking notable, not risk. Never traffic lights.
 */
export function ScoreTable({ career }: { career: Career }) {
  const nows = career.tracks.map(nowScore);
  const max = Math.max(...nows);
  const min = Math.min(...nows);

  return (
    <table className="scores">
      <thead>
        <tr>
          <th>{career.name} track</th>
          <th>2023</th>
          <th>2025</th>
          <th>Now</th>
          <th>3-yr move</th>
          <th>Band</th>
        </tr>
      </thead>
      <tbody>
        {career.tracks.map((t, i) => {
          const now = nowScore(t);
          const cls = now === max ? "top" : now === min ? "low" : undefined;
          return (
            <tr key={i} className={cls}>
              <td>{t.name}</td>
              <td>{t.scores["2023"].toFixed(1)}</td>
              <td>{t.scores["2025"].toFixed(1)}</td>
              <td className="now">{now.toFixed(1)}</td>
              <td>{move(t)}</td>
              <td className="band">{BAND_LABEL[t.band]}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
