export function Coming({ title, blurb }: { title: string; blurb: string }) {
  return (
    <>
      <div className="hub-top"><h1>{title}</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">{blurb}</p>
        <p style={{ color: "var(--pencil)", marginTop: 18, fontSize: "0.85rem" }}>
          <span className="pill">Building</span>&nbsp; This section is next in the build.
        </p>
      </div>
    </>
  );
}
