"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { handleTaken } from "@/lib/members";
import { blockMember, unblockMember, iBlocked } from "@/lib/safety";

export type UpdateResult = { ok: boolean; error?: string };

export async function updateProfile(_prev: UpdateResult | null, formData: FormData): Promise<UpdateResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Not signed in." };

  const STAGES = ["Student", "Early-career", "Mid-career", "Senior", "Leader"];
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 80) || null;
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 600) || null;
  const podIntro = String(formData.get("podIntro") ?? "").trim().slice(0, 240) || null;
  const rawStage = String(formData.get("careerStage") ?? "").trim();
  const careerStage = STAGES.includes(rawStage) ? rawStage : null;
  let handle: string | null = String(formData.get("handle") ?? "").trim().toLowerCase().replace(/^@/, "");

  if (handle) {
    if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
      return { ok: false, error: "Handle must be 3–30 characters: letters, numbers, or underscores." };
    }
    if (await handleTaken(handle, userId)) return { ok: false, error: "That handle is taken." };
  } else {
    handle = null;
  }

  await db.update(profiles).set({ displayName, bio, handle, careerStage, podIntro }).where(eq(profiles.clerkUserId, userId));
  revalidatePath("/hub/members");
  revalidatePath(`/hub/members/${handle ?? userId}`);
  return { ok: true };
}

/** Toggle a block on another member. */
export async function toggleBlock(otherId: string) {
  const { userId } = await auth();
  if (!userId || !otherId || otherId === userId) return;
  if (await iBlocked(userId, otherId)) await unblockMember(userId, otherId);
  else await blockMember(userId, otherId);
  revalidatePath(`/hub/members/${otherId}`);
  revalidatePath("/hub/members");
}
