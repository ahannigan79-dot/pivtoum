import { and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

/** Set of completed Build rep keys (e.g. "gym:audit-accounting", "rebuild"). */
export async function getBuildReps(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ key: lessonProgress.lessonKey, status: lessonProgress.status })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "build:%")));
  const done = new Set<string>();
  for (const r of rows) if (r.status === "complete") done.add(r.key.replace(/^build:/, ""));
  return done;
}
