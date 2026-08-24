import Link from "next/link";

/** Full-bleed embed of a Winning Loop tool, with a slim back-bar to Build. */
export function ToolFrame({ src, title, backHref = "/hub/build", backLabel = "Build" }: {
  src: string; title: string; backHref?: string; backLabel?: string;
}) {
  return (
    <>
      <div className="hub-toolbar">
        <Link href={backHref} className="back">‹ {backLabel}</Link>
        <span className="tt">{title}</span>
      </div>
      <iframe src={src} title={title} className="hub-toolframe" />
    </>
  );
}
