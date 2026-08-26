"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSubmission, MEMBER_SESSION_TYPES } from "@/lib/submissions";

/** A member proposes a session to host. Lands in the founder review queue. */
export async function proposeSession(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  const typeRaw = String(formData.get("type") ?? "sme");
  const type = (MEMBER_SESSION_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "sme";
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const durationMins = Number(formData.get("durationMins")) || 45;
  const joinUrl = String(formData.get("joinUrl") ?? "").trim().slice(0, 500);

  await createSubmission({
    memberId: userId, kind: "session", title, body,
    details: { type, startsAt: startsAt || undefined, durationMins, joinUrl: joinUrl || undefined },
  });
  revalidatePath("/hub/contribute");
}

/** A member submits an article for review. Publishes to the feed on approval. */
export async function submitArticle(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  await createSubmission({ memberId: userId, kind: "article", title, body, details: {} });
  revalidatePath("/hub/contribute");
}
