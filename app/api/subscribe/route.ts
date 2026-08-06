import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addSubscriber } from "@/lib/db";
import { getCareer } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { pdfWelcomeEmail } from "@/lib/emails";
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
    try {
      const { html, text } = pdfWelcomeEmail({
        pdfUrl,
        pdfLabel,
        code: "PARENT20",
        discountLabel: "20% off",
        expiresDays: 7,
        buyUrl: `${SITE.url}/buy`,
      });
      const resend = new Resend(apiKey);
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
  }

  return NextResponse.json({ ok: true });
}
