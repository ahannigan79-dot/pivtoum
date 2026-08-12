import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getOrder, markClaimed } from "@/lib/db";
import { isClaimable } from "@/lib/profiles";
import { isUnlimitedSize } from "@/lib/packs";
import { getCareer } from "@/data/careers";
import { signDownload, SEVEN_DAYS_MS } from "@/lib/download";
import { purchaseEmail } from "@/lib/emails";
import { getStripe } from "@/lib/stripe";
import { SITE } from "@/lib/site";

/**
 * Turn a selection into delivered PDFs. First claim requires a selection of
 * exactly pack_size; a claimed order re-issues its existing selection.
 */
export async function POST(req: Request) {
  const { token, slugs, stage: stageIn } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const order = await getOrder(token);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  let selected: string[];
  if (order.claimed) {
    selected = order.selected; // re-issue
  } else {
    selected = Array.isArray(slugs) ? [...new Set(slugs)] : [];
    // Unlimited grants the whole catalog, so any 1..all is valid; a fixed pack
    // must be claimed exactly.
    const unlimited = isUnlimitedSize(order.pack_size);
    const ok = unlimited
      ? selected.length >= 1 && selected.length <= order.pack_size
      : selected.length === order.pack_size;
    if (!ok) {
      return NextResponse.json(
        {
          error: unlimited
            ? "Choose at least one career."
            : `Choose exactly ${order.pack_size} career(s).`,
        },
        { status: 400 },
      );
    }
    if (!selected.every(isClaimable)) {
      return NextResponse.json({ error: "One or more selections are invalid." }, { status: 400 });
    }
  }

  // Which stage guide to deliver. A first claim carries the buyer's choice from
  // the picker; a re-send uses the stage stored on the order. Old orders that
  // predate stage tracking fall back to the planning guide.
  let stage: "planning" | "active";
  if (order.claimed) {
    stage = order.stage === "active" ? "active" : "planning";
  } else if (stageIn === "planning" || stageIn === "active") {
    stage = stageIn;
  } else {
    return NextResponse.json(
      { error: "Tell us where you are — still choosing, or already in it." },
      { status: 400 },
    );
  }

  const exp = Date.now() + SEVEN_DAYS_MS;
  const dl = (slug: string) => `${SITE.url}/api/download?d=${signDownload(slug, stage, token, exp)}`;
  const items = selected.map((slug) => ({
    name: getCareer(slug)?.name ?? slug,
    url: dl(slug),
  }));
  // Flat list for the plain-text part and the email-not-configured fallback.
  const links = items.map((it) => ({ name: it.name, url: it.url }));

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const emailConfigured = Boolean(apiKey && from);

  // The Expert Meeting add-on is recorded on the Stripe session metadata, so we
  // read it here (best-effort) rather than adding an orders column. When present,
  // the delivery email carries the private booking link (or a "we'll email you"
  // note if EXPERT_BOOKING_URL isn't configured yet).
  let expert: { bookingUrl?: string } | undefined;
  try {
    const session = await getStripe().checkout.sessions.retrieve(token);
    if (session?.metadata?.expert === "true") {
      expert = { bookingUrl: process.env.EXPERT_BOOKING_URL || undefined };
    }
  } catch {
    /* ignore — deliver the guides without the expert block */
  }

  if (apiKey && from) {
    const resend = new Resend(apiKey);
    const { html, text } = purchaseEmail(items, token, expert);
    const { error } = await resend.emails.send({
      from,
      to: order.email,
      subject: "Your Pivotum Career Value Guides",
      html,
      text,
    });
    if (error) return NextResponse.json({ error: "Could not send email." }, { status: 502 });
  }

  if (!order.claimed) await markClaimed(token, selected, stage);

  // When email isn't wired up yet, hand the signed links straight back so the
  // flow is still testable. Once Resend is configured, delivery is by email only.
  return NextResponse.json({
    ok: true,
    delivered: items.length,
    email: order.email,
    emailed: emailConfigured,
    links: emailConfigured ? undefined : links,
  });
}
