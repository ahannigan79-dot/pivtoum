import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mapStates } from "@/db/schema";
import { MapFrame } from "@/components/hub/MapFrame";

export const metadata = { title: "Your Map — Pivotum" };

export default async function MapPage() {
  const { userId } = await auth();
  const latest = userId
    ? (await db.select({ answers: mapStates.answers }).from(mapStates)
        .where(eq(mapStates.memberId, userId)).orderBy(desc(mapStates.createdAt)).limit(1))[0]
    : null;
  return <MapFrame savedAnswers={latest?.answers ?? null} />;
}
