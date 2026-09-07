"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { LESSON_BY_KEY } from "@/lib/learn";
import { awardBadge } from "@/lib/badges";
import { requireMember } from "@/lib/gate";

/** Mark a Learn lesson complete — counts as effort (learn:*) and, on the first
 *  one, earns the Grounded credential. */
export async function completeLesson(key: string) {
  const userId = await requireMember();
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
