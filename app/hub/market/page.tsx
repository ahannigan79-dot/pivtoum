import { notFound } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { listLanes } from "@/lib/baselines";
import { LaneRow } from "@/components/hub/market/LaneRow";

export const metadata = { title: "Market baselines — Winning in the Age of AI" };

export default async function MarketPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) notFound();
  const lanes = await listLanes();

  return (
    <>
      <div className="hub-top"><h1>Market baselines</h1><span className="sp" /><span className="hub-pill">Founder view</span></div>
      <div className="hub-body">
        <p className="hub-lead">
          A lane&apos;s <b>market baseline</b> is the exposure the field carries before anyone&apos;s personal
          protections or effort. Re-score it when the market moves and every member in the lane moves with it —
          their earned improvement carries forward, and each gets a note explaining why their number changed.
        </p>

        {lanes.length === 0 ? (
          <p className="creds-empty">No lanes occupied yet — baselines appear here once members have mapped.</p>
        ) : (
          <div className="lbgrid">
            {lanes.map((row) => <LaneRow key={`${row.careerSlug}|${row.lane}`} row={row} />)}
          </div>
        )}
      </div>
    </>
  );
}
