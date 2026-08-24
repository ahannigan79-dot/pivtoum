import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates } from "@/db/schema";
import { PERSONAL_RESCORE_DAYS } from "@/lib/trajectory";
import { MapFrame } from "@/components/hub/MapFrame";

export const metadata = { title: "Your Map — Pivotum" };

export default async function MapPage() {
  const { userId } = await auth();
  const latest = userId
    ? (await db.select({ answers: mapStates.answers, at: mapStates.createdAt }).from(mapStates)
        .where(eq(mapStates.memberId, userId)).orderBy(desc(mapStates.createdAt)).limit(1))[0]
    : null;
  const rescoreDue = !!latest && (Date.now() - latest.at.getTime()) / 86400000 >= PERSONAL_RESCORE_DAYS;
  return <MapFrame savedAnswers={latest?.answers ?? null} rescoreDue={rescoreDue} />;
}
