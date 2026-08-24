"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

const DM_POLICIES = new Set(["all", "pods", "none"]);

export async function updateEmailPrefs(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const dmRaw = String(formData.get("dmPrivacy") ?? "all");
  await db.update(profiles).set({
    emailInstant: formData.get("emailInstant") === "on",
    emailDigest: formData.get("emailDigest") === "on",
    dmPrivacy: DM_POLICIES.has(dmRaw) ? dmRaw : "all",
    showMap: formData.get("showMap") === "on",
  }).where(eq(profiles.clerkUserId, userId));
  revalidatePath("/hub/settings");
}
