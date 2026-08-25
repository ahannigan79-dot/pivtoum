"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { LESSON_BY_KEY } from "@/lib/learn";
import { awardBadge } from "@/lib/badges";

/** Mark a Learn lesson complete — counts as effort (learn:*) and, on the first
 *  one, earns the Grounded credential. */
export async function completeLesson(key: string) {
  const { userId } = await auth();
  if (!userId || !LESSON_BY_KEY[key]) return;
  const lessonKey = `learn:${key}`;
  await db.insert(lessonProgress)
    .values({ memberId: userId, lessonKey, status: "complete" })
    .onConflictDoUpdate({
      target: [lessonProgress.memberId, lessonProgress.lessonKey],
      set: { status: "complete", updatedAt: new Date() },
    });
  await awardBadge(userId, "grounded"); // idempotent; notifies once
  revalidatePath("/hub/learn");
  revalidatePath(`/hub/learn/${key}`);
  revalidatePath("/hub");
}
