"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function updateEmailPrefs(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  await db.update(profiles).set({
    emailInstant: formData.get("emailInstant") === "on",
    emailDigest: formData.get("emailDigest") === "on",
  }).where(eq(profiles.clerkUserId, userId));
  revalidatePath("/hub/settings");
}
