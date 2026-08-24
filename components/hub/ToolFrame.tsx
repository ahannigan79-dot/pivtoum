import Link from "next/link";
import { LogRep } from "./LogRep";

/** Full-bleed embed of a Winning Loop tool, with a slim back-bar to Build.
 *  Pass repKey to show a "Log this rep" affordance that ticks the plan. */
export function ToolFrame({ src, title, backHref = "/hub/build", backLabel = "Build", repKey }: {
  src: string; title: string; backHref?: string; backLabel?: string; repKey?: string;
}) {
  return (
    <>
      <div className="hub-toolbar">
        <Link href={backHref} className="back">‹ {backLabel}</Link>
        <span className="tt">{title}</span>
        {repKey && <span className="tool-rep"><LogRep repKey={repKey} /></span>}
      </div>
      <iframe src={src} title={title} className="hub-toolframe" />
    </>
  );
}
