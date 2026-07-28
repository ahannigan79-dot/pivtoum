import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPack } from "@/lib/packs";
import { SITE } from "@/lib/site";

/** /buy posts here. Creates a hosted Stripe Checkout session and redirects to it. */
export async function POST(req: Request) {
  const form = await req.formData();
  const pack = getPack(Number(form.get("pack")));
  if (!pack) return NextResponse.json({ error: "Unknown pack." }, { status: 400 });

  // Graceful state until Stripe keys are configured, so a live "buy" click
  // never crashes.
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><title>Checkout opening soon</title>` +
        `<body style="font-family:system-ui;max-width:34rem;margin:15vh auto;padding:0 1.5rem;color:#211E1B;line-height:1.6">` +
        `<h1 style="font-weight:600">Checkout is opening soon</h1>` +
        `<p>Paid profiles aren’t quite live yet. In the meantime the free samplers and the full computer science profile are open.</p>` +
        `<p><a href="/" style="color:#AC3A34">← Back to Pivotum</a></p></body>`,
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pack.priceCents,
          product_data: {
            name: `Pivotum — ${pack.label} pack`,
            description: "Full career profiles, chosen after checkout. Includes Spring 2027 updates.",
          },
        },
      },
    ],
    metadata: { pack_size: String(pack.size) },
    // Stripe substitutes {CHECKOUT_SESSION_ID}; that id is also the claim token.
    success_url: `${SITE.url}/claim/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/buy`,
  });

  if (!session.url) return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  return NextResponse.redirect(session.url, 303);
}
