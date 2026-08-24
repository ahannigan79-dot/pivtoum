import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { SITE } from "@/lib/site";

export type Membership = {
  linked: boolean;
  status: string | null;       // active | trialing | past_due | canceled | ...
  active: boolean;             // access-worthy status
  renewsAt: Date | null;
  plan: string | null;
  cancelHint: boolean;         // status suggests attention (past_due/canceled/unpaid)
};

const ACTIVE = new Set(["active", "trialing"]);
const ATTENTION = new Set(["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired"]);

export function billingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Is a sellable membership (recurring price) configured? */
export function membershipConfigured(): boolean {
  return billingConfigured() && Boolean(process.env.STRIPE_MEMBERSHIP_PRICE_ID);
}

export type MembershipOffer = { configured: boolean; priceLabel: string | null; trialDays: number };

/** The join offer shown to members without an active subscription. */
export async function getMembershipOffer(): Promise<MembershipOffer> {
  if (!membershipConfigured()) return { configured: false, priceLabel: null, trialDays: 0 };
  const trialDays = Number(process.env.STRIPE_MEMBERSHIP_TRIAL_DAYS ?? 0) || 0;
  let priceLabel: string | null = null;
  try {
    const price = await getStripe().prices.retrieve(process.env.STRIPE_MEMBERSHIP_PRICE_ID!);
    if (price.unit_amount != null) {
      const amt = (price.unit_amount / 100).toLocaleString(undefined, { style: "currency", currency: price.currency });
      priceLabel = price.recurring?.interval ? `${amt}/${price.recurring.interval}` : amt;
    }
  } catch { /* show a generic label */ }
  return { configured: true, priceLabel, trialDays };
}

/** Start a membership subscription — returns a Stripe Checkout URL. */
export async function createSubscriptionCheckout(userId: string, email: string | null): Promise<string | null> {
  if (!membershipConfigured()) return null;
  const price = process.env.STRIPE_MEMBERSHIP_PRICE_ID!;
  const trialDays = Number(process.env.STRIPE_MEMBERSHIP_TRIAL_DAYS ?? 0) || 0;
  const r = await db.select({ cust: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1);
  const cust = r[0]?.cust ?? null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: userId,
      ...(cust ? { customer: cust } : email ? { customer_email: email } : {}),
      ...(trialDays ? { subscription_data: { trial_period_days: trialDays } } : {}),
      success_url: `${SITE.url}/hub/membership?welcome=1`,
      cancel_url: `${SITE.url}/hub/membership`,
    });
    return session.url;
  } catch (err) {
    console.error("[billing] checkout", String(err));
    return null;
  }
}

/** Directly link a member to a Stripe customer (used from the subscription checkout webhook). */
export async function linkCustomer(userId: string, customerId: string): Promise<void> {
  await db.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.clerkUserId, userId));
}

/** Read a member's stored subscription snapshot. */
export async function getMembership(userId: string): Promise<Membership> {
  const r = await db.select({
    cust: profiles.stripeCustomerId, status: profiles.subStatus, renews: profiles.subRenewsAt, plan: profiles.subPlan,
  }).from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1);
  const p = r[0];
  if (!p || (!p.cust && !p.status)) {
    return { linked: false, status: null, active: false, renewsAt: null, plan: null, cancelHint: false };
  }
  return {
    linked: true, status: p.status, active: p.status ? ACTIVE.has(p.status) : false,
    renewsAt: p.renews, plan: p.plan, cancelHint: p.status ? ATTENTION.has(p.status) : false,
  };
}

/** Best plan label from a subscription's first item. */
function planLabel(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0];
  const price = item?.price;
  const nick = price?.nickname;
  if (nick) return nick;
  if (price?.unit_amount != null) {
    const amt = (price.unit_amount / 100).toLocaleString(undefined, { style: "currency", currency: price.currency });
    const interval = price.recurring?.interval;
    return interval ? `${amt}/${interval}` : amt;
  }
  return null;
}

/** Sync a member's subscription snapshot from a Stripe subscription. Resolves the
 *  member by an explicit id, else the stored customer id, else the customer email. */
export async function syncSubscription(sub: Stripe.Subscription, memberId?: string): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  // `current_period_end` lives on the subscription in older API versions and on
  // the subscription item in newer ones — read whichever is present.
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (sub.items.data[0] as unknown as { current_period_end?: number })?.current_period_end;
  const fields = { subStatus: sub.status, subRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null, subPlan: planLabel(sub) };

  if (memberId) {
    await db.update(profiles).set({ stripeCustomerId: customerId, ...fields }).where(eq(profiles.clerkUserId, memberId));
    return;
  }
  // Already linked to this customer? Update in place.
  const updated = await db.update(profiles).set(fields)
    .where(eq(profiles.stripeCustomerId, customerId)).returning({ id: profiles.clerkUserId });
  if (updated.length) return;

  // Not linked yet → match by the customer's email and link.
  let email: string | null = null;
  try {
    const cust = await getStripe().customers.retrieve(customerId);
    if (cust && !("deleted" in cust && cust.deleted)) email = (cust as Stripe.Customer).email;
  } catch { /* ignore */ }
  if (!email) return;
  await db.update(profiles).set({ stripeCustomerId: customerId, ...fields }).where(eq(profiles.email, email));
}

/** Create a Stripe Billing Portal session for the member. Self-heals a missing
 *  customer id by looking the customer up by email. Returns null if not billable. */
export async function createPortalSession(userId: string, returnUrl: string): Promise<string | null> {
  if (!billingConfigured()) return null;
  const r = await db.select({ cust: profiles.stripeCustomerId, email: profiles.email })
    .from(profiles).where(eq(profiles.clerkUserId, userId)).limit(1);
  const p = r[0];
  if (!p) return null;

  let customerId = p.cust;
  if (!customerId && p.email) {
    try {
      const found = await getStripe().customers.list({ email: p.email, limit: 1 });
      customerId = found.data[0]?.id ?? null;
      if (customerId) await db.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.clerkUserId, userId));
    } catch { /* ignore */ }
  }
  if (!customerId) return null;

  try {
    const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return session.url;
  } catch (err) {
    console.error("[billing] portal", String(err));
    return null;
  }
}
