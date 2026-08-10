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
 * The current lead offer is the 10% Founding Subscriber Discount; point
 * STRIPE_FOUNDING_COUPON_ID at that 10% Coupon in Stripe. STRIPE_LEAD_COUPON_ID
 * is the older 20% coupon, kept only as a fallback for backwards compatibility
 * — set the founding var and new leads mint 10% codes. Existing 20% codes
 * already issued keep working regardless: a Promotion Code always redeems
 * against its own Coupon, so honouring old holders needs nothing here beyond
 * leaving the 20% coupon in place in Stripe.
 *
 * Here we create a fresh Promotion Code on the chosen coupon per person, capped
 * at one redemption and expiring in `days`. Stripe tracks redemption and expiry,
 * so there's nothing to manage by hand. Returns null when Stripe or the coupon
 * isn't configured, so the caller can fall back to a shared code.
 */
export async function mintLeadPromoCode(days: number): Promise<string | null> {
  const coupon = process.env.STRIPE_FOUNDING_COUPON_ID || process.env.STRIPE_LEAD_COUPON_ID;
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
