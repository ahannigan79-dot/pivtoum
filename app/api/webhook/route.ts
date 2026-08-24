import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { upsertOrder } from "@/lib/db";
import { syncSubscription, linkCustomer } from "@/lib/billing";
import { EDITION } from "@/lib/site";

/** Stripe → order. Verifies the signature against the raw body, then records the order. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Community membership: keep each member's subscription snapshot fresh.
  if (event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted") {
    await syncSubscription(event.data.object as Stripe.Subscription);
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // A subscription checkout → link the member immediately (don't treat as a guide order).
    if (session.mode === "subscription" && session.subscription) {
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const memberId = session.client_reference_id ?? undefined; // the Clerk user id we set at checkout
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (memberId && customerId) await linkCustomer(memberId, customerId);
      try { await syncSubscription(await getStripe().subscriptions.retrieve(subId), memberId); } catch { /* ignore */ }
      return NextResponse.json({ received: true });
    }
    const email = session.customer_details?.email ?? session.customer_email ?? "";
    const packSize = Number(session.metadata?.pack_size ?? 0);
    const edition = session.metadata?.edition ?? EDITION;
    const acknowledgedAt = session.metadata?.acknowledged_at ?? null;
    if (email && packSize > 0) {
      await upsertOrder(session.id, email, packSize, edition, acknowledgedAt);

      // Mark the buyer in Resend so the nurture drip stops pitching them the
      // profiles they just bought (the long-tail emails are gated on this
      // `purchased` property), and fire a `profile_purchased` event for a
      // future buyer flow. Best-effort — the order is already recorded above,
      // and the Resend SDK returns { error } rather than throwing.
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        try {
          const upd = await resend.contacts.update({
            email,
            properties: { purchased: "true" },
          });
          const evt = await resend.events.send({ event: "profile_purchased", email });
          if (upd.error || evt.error) {
            console.error("[purchase] resend", {
              updError: upd.error ?? null,
              evtError: evt.error ?? null,
            });
          }
        } catch (err) {
          console.error("[purchase] resend threw", String(err));
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
