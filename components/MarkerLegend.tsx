/** The four-swatch marker legend. Order and meanings match the highlight syntax. */
export function MarkerLegend() {
  return (
    <div className="key">
      <span>
        <i style={{ background: "rgba(255,226,110,.62)" }} />
        The finding
      </span>
      <span>
        <i style={{ background: "rgba(247,166,166,.55)" }} />
        Exposure
      </span>
      <span>
        <i style={{ background: "rgba(163,214,190,.6)" }} />
        Protection
      </span>
      <span>
        <i style={{ background: "rgba(166,198,236,.55)" }} />
        Method
      </span>
    </div>
  );
}
