"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateDMThread, sendDM } from "@/lib/dms";

/** Open (or start) a DM with another member. */
export async function startDM(otherId: string) {
  const { userId } = await auth();
  if (!userId || !otherId || otherId === userId) return;
  const threadId = await getOrCreateDMThread(userId, otherId);
  redirect(`/hub/messages/${threadId}`);
}

export async function sendMessage(threadId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const body = String(formData.get("body") ?? "");
  await sendDM(threadId, userId, body);
  revalidatePath(`/hub/messages/${threadId}`);
  revalidatePath("/hub/messages");
}
