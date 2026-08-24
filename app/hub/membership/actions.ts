"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createPortalSession } from "@/lib/billing";
import { SITE } from "@/lib/site";

/** Open the Stripe Billing Customer Portal for the member. */
export async function openPortal() {
  const { userId } = await auth();
  if (!userId) return;
  const url = await createPortalSession(userId, `${SITE.url}/hub/membership`);
  redirect(url ?? "/hub/membership?portal=unavailable");
}
