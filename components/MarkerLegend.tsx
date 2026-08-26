/** The marker legend — swatches match the highlight text colors (brand palette). */
export function MarkerLegend() {
  return (
    <div className="key">
      <span>
        <i style={{ background: "var(--accent)" }} />
        The finding
      </span>
      <span>
        <i style={{ background: "var(--pen)" }} />
        Exposure
      </span>
      <span>
        <i style={{ background: "var(--pen-safe)" }} />
        Protection
      </span>
      <span>
        <i style={{ background: "var(--ink)" }} />
        Method
      </span>
    </div>
  );
}
