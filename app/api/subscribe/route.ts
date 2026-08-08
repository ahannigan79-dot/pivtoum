import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addSubscriber } from "@/lib/db";
import { getCareer } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { pdfWelcomeEmail } from "@/lib/emails";
import { mintLeadPromoCode } from "@/lib/stripe";
import { SITE } from "@/lib/site";

/**
 * Email capture. Stored in Postgres (we own the list) and mirrored to Substack
 * (best-effort). Then delivers the requested PDF — the sampler for the page they
 * were on, or all 28 scores — by email, with the subscriber discount. `source`
 * is a sampler slug or "index".
 */
export async function POST(req: Request) {
  const { email, source } = await req.json().catch(() => ({ email: "", source: "index" }));
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  try {
    await addSubscriber(email);
  } catch {
    return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
  }

  // Optional mirror to Substack, best-effort. Substack has no official API; this
  // posts to the same free-subscribe endpoint its own embed form uses, so it can
  // change without notice — its failure never fails the signup.
  const substack = process.env.SUBSTACK_PUBLICATION_URL ?? "https://pivotum.substack.com";
  if (substack) {
    const base = substack.replace(/\/+$/, "");
    try {
      await fetch(`${base}/api/v1/free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_url: `${base}/`,
          first_referrer: "",
          current_url: `${base}/`,
          referral_code: "",
          source: "embed",
          should_not_show_recommendations: false,
        }),
      });
    } catch {
      /* ignore — Postgres already has it */
    }
  }

  // Deliver the requested PDF + subscriber offer by email (best-effort — the
  // signup already succeeded above, so a mail failure never fails the request).
  const slug = typeof source === "string" && hasSamplerPage(source) ? source : "index";
  const career = slug === "index" ? null : getCareer(slug);
  const pdfLabel = career ? `${career.name} sampler` : "all 28 scores";
  const pdfUrl = `${SITE.url}/api/sampler-pdf?s=${slug}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) {
    const expiresDays = 7;
    // A unique single-use code per subscriber; falls back to a shared code if
    // Stripe / the lead coupon isn't configured.
    const code = (await mintLeadPromoCode(expiresDays)) ?? "PARENT20";
    const resend = new Resend(apiKey);
    try {
      const { html, text } = pdfWelcomeEmail({
        pdfUrl,
        pdfLabel,
        code,
        discountLabel: "20% off",
        expiresDays,
        buyUrl: `${SITE.url}/buy`,
      });
      await resend.emails.send({
        from,
        to: email,
        subject: career ? `Your ${career.name} sampler (PDF)` : "Your 28 AI-exposure scores (PDF)",
        html,
        text,
      });
    } catch {
      /* delivery is best-effort — the address is already on the list */
    }

    // Enrol the lead in our Resend audience so the nurture automation
    // (Resend › Automations, triggered by "contact added to audience") drips
    // the follow-up sequence. We attach the subscriber's discount code as a
    // `promo_code` contact property so the day-6 reminder email can surface it
    // via a {{promo_code}} merge tag. Best-effort throughout: if that property
    // isn't defined in Resend yet (or the contact already exists) we retry the
    // plain add, and any failure still never blocks the saved signup.
    try {
      await resend.contacts.create({
        email,
        unsubscribed: false,
        properties: { promo_code: code },
      });
    } catch {
      try {
        await resend.contacts.create({ email, unsubscribed: false });
      } catch {
        /* best-effort — nurture enrolment is a bonus on top of the saved signup */
      }
    }

    // Fire the custom event that starts the Resend nurture automation
    // (Automations › trigger: "Custom event" = `pdf_requested`). The contact
    // was added just above, so the drip has someone to act on. Best-effort:
    // a missing event definition or API hiccup never blocks the signup.
    try {
      await resend.events.send({ event: "pdf_requested", email });
    } catch {
      /* best-effort — the nurture drip is a bonus on top of the saved signup */
    }
  }

  return NextResponse.json({ ok: true });
}
