import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPack } from "@/lib/packs";
import { SITE, EDITION } from "@/lib/site";

/** /buy posts here. Creates a hosted Stripe Checkout session and redirects to it. */
export async function POST(req: Request) {
  const form = await req.formData();
  const pack = getPack(Number(form.get("pack")));
  if (!pack) return NextResponse.json({ error: "Unknown pack." }, { status: 400 });

  // Required acknowledgement: analysis-not-advice + immediate delivery. The buy
  // form blocks submission until it's ticked; re-check here in case of a direct
  // POST, and record it with the order via the Stripe session metadata.
  if (form.get("ack") !== "1") {
    return NextResponse.json(
      { error: "Please tick the acknowledgement to continue." },
      { status: 400 },
    );
  }
  const acknowledgedAt = new Date().toISOString();

  // Graceful state until Stripe keys are configured, so a live "buy" click
  // never crashes.
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><title>Checkout opening soon</title>` +
        `<body style="font-family:system-ui;max-width:34rem;margin:15vh auto;padding:0 1.5rem;color:#211E1B;line-height:1.6">` +
        `<h1 style="font-weight:600">Checkout is opening soon</h1>` +
        `<p>The paid Career Value Guide isn’t quite live yet. In the meantime the free samplers and the full computer science guide are open.</p>` +
        `<p><a href="/" style="color:#AC3A34">← Back to Pivotum</a></p></body>`,
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Subscriber discount (PARENT20) arrives by email; let buyers enter it at checkout.
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pack.priceCents,
          product_data: {
            name: `Pivotum — ${pack.label} pack`,
            description: "Career Value Guides, chosen after checkout. Every future edition included.",
          },
        },
      },
    ],
    metadata: {
      pack_size: String(pack.size),
      edition: EDITION,
      acknowledged: "true",
      acknowledged_at: acknowledgedAt,
      ack_terms: "analysis-not-advice-v1",
    },
    // Stripe substitutes {CHECKOUT_SESSION_ID}; that id is also the claim token.
    success_url: `${SITE.url}/claim/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/buy`,
  });

  if (!session.url) return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  return NextResponse.redirect(session.url, 303);
}
