import Link from "next/link";
import type { Career } from "@/data/careers";
import { MarkerLegend } from "@/components/MarkerLegend";

export function CareerHeader({ career }: { career: Career }) {
  return (
    <header>
      <div className="crumb">
        <span>
          <Link href="/">Pivotum</Link>
        </span>
        <i>/</i>
        <span>
          <Link href="/#index">All careers</Link>
        </span>
        <i>/</i>
        <span>{career.name}</span>
        <i>/</i>
        <span>{career.edition}</span>
      </div>
      <h1>{career.title}</h1>
      <p className="kicker">Free sampler. Re-scored every six months.</p>
      <MarkerLegend />
    </header>
  );
}
