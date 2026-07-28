/** The two-column "AI is taking / it can't touch" grid. */
export function VersusGrid({
  taking,
  untouched,
  takingLabel = "AI is taking",
  untouchedLabel = "It can't touch",
}: {
  taking: string[];
  untouched: string[];
  takingLabel?: string;
  untouchedLabel?: string;
}) {
  const rows = Math.max(taking.length, untouched.length);
  return (
    <div className="cols">
      <div className="row head">
        <span>{takingLabel}</span>
        <span>{untouchedLabel}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="row" key={i}>
          <span>{taking[i] ?? ""}</span>
          <span className="r">{untouched[i] ?? ""}</span>
        </div>
      ))}
    </div>
  );
}
