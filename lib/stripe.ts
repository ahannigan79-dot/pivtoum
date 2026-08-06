import Stripe from "stripe";

/** Lazily construct Stripe so a missing key never breaks the build — only runtime. */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

/**
 * Mint a unique, single-use, time-limited discount code for a new subscriber.
 *
 * One reusable Coupon (the 20%-off discount) lives in Stripe; its id is in
 * STRIPE_LEAD_COUPON_ID. Here we create a fresh Promotion Code on it per person,
 * capped at one redemption and expiring in `days`. Stripe tracks redemption and
 * expiry, so there's nothing to manage by hand. Returns null when Stripe or the
 * coupon isn't configured, so the caller can fall back to a shared code.
 */
export async function mintLeadPromoCode(days: number): Promise<string | null> {
  const coupon = process.env.STRIPE_LEAD_COUPON_ID;
  if (!process.env.STRIPE_SECRET_KEY || !coupon) return null;
  try {
    const promo = await getStripe().promotionCodes.create({
      promotion: { type: "coupon", coupon },
      max_redemptions: 1,
      expires_at: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60,
    });
    return promo.code;
  } catch {
    return null;
  }
}
