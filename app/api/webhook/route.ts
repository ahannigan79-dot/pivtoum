import { NextResponse } from "next/server";
import type Stripe from "stripe";
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
    if (email && packSize > 0) {
      await upsertOrder(session.id, email, packSize, edition);
    }
  }

  return NextResponse.json({ received: true });
}
