/** The two community values — Embrace + Together — kept visible everywhere. */
export function ValuesBanner({ variant = "feed" }: { variant?: "feed" | "pod" }) {
  return (
    <aside className={"values " + variant}>
      <div className="value">
        <span className="value-k">Embrace</span>
        <p>Face the change head-on. Bring AI into your work, do the reps, and share what you learn — we don&apos;t pretend it isn&apos;t happening.</p>
      </div>
      <div className="value">
        <span className="value-k">Together</span>
        <p>
          We win as a group. Be generous, be kind, and assume good faith — there&apos;s a real person on the other side, and no question is too small.
          {variant === "pod" && " What's shared in your pod stays in your pod."}
        </p>
      </div>
    </aside>
  );
}
