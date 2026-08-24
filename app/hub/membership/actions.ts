"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createPortalSession, createSubscriptionCheckout } from "@/lib/billing";
import { getOrCreateProfile } from "@/lib/member";
import { SITE } from "@/lib/site";

/** Open the Stripe Billing Customer Portal for the member. */
export async function openPortal() {
  const { userId } = await auth();
  if (!userId) return;
  const url = await createPortalSession(userId, `${SITE.url}/hub/membership`);
  redirect(url ?? "/hub/membership?portal=unavailable");
}

/** Start a membership subscription via Stripe Checkout. */
export async function startMembership() {
  const { userId } = await auth();
  if (!userId) return;
  const profile = await getOrCreateProfile();
  const url = await createSubscriptionCheckout(userId, profile?.email ?? null);
  redirect(url ?? "/hub/membership?checkout=unavailable");
}
