import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { upsertOrder } from "@/lib/db";
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
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
