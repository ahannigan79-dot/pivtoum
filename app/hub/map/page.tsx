import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates } from "@/db/schema";
import { PERSONAL_RESCORE_DAYS } from "@/lib/trajectory";
import { getOrCreateProfile } from "@/lib/member";
import { getStanding } from "@/lib/standing";
import { MapFrame } from "@/components/hub/MapFrame";

export const metadata = { title: "Your Map — Pivotum" };

export default async function MapPage() {
  const { userId } = await auth();
  const [latestRows, profile] = await Promise.all([
    userId
      ? db.select({ answers: mapStates.answers, at: mapStates.createdAt }).from(mapStates)
          .where(eq(mapStates.memberId, userId)).orderBy(desc(mapStates.createdAt)).limit(1)
      : Promise.resolve([]),
    getOrCreateProfile(),
  ]);
  const latest = latestRows[0] ?? null;
  const rescoreDue = !!latest && (Date.now() - latest.at.getTime()) / 86400000 >= PERSONAL_RESCORE_DAYS;
  // The current, post-work score — so the Map's reading lines up with the dashboard.
  const standing = await getStanding(userId, profile?.careerSlug, profile?.currentLane);

  return (
    <>
      {standing.hasMap && standing.dividend > 0 && (
        <div className="map-standing">
          <span className="map-standing-k">Where you stand today</span>
          <span className="map-standing-n">{standing.current}</span>
          <span className="map-standing-note">
            This map reads <b>{standing.mapReading}</b> — the work you&rsquo;ve banked has bought down{" "}
            <b>{standing.dividend}</b>, so you&rsquo;re at <b>{standing.current}</b> today. Your dashboard tracks this live.
          </span>
        </div>
      )}
      <MapFrame savedAnswers={latest?.answers ?? null} rescoreDue={rescoreDue} />
    </>
  );
}
