import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addSubscriber } from "@/lib/db";
import { getCareer } from "@/data/careers";
import { hasSamplerPage } from "@/content/careers/registry";
import { packageEmail, pdfWelcomeEmail } from "@/lib/emails";
import { mintLeadPromoCode } from "@/lib/stripe";
import { SITE } from "@/lib/site";

/**
 * Email capture. Stored in Postgres (we own the list) and mirrored to Substack
 * (best-effort). Then delivers the requested PDF — the sampler for the page they
 * were on, or all 28 scores — by email, with the subscriber discount. `source`
 * is a sampler slug or "index".
 */
export async function POST(req: Request) {
  const { email, source, stage, audience, careers } = await req
    .json()
    .catch(() => ({ email: "", source: "index" }));
  // The Career Map capture sends the two package flags + up to three career
  // picks. Kept optional so the plain /scores + on-page EmailSignup forms (email
  // + source only) keep working unchanged. Assembling and delivering the full
  // package from these is the next increment; for now we capture them so no lead
  // is lost, and still send the index PDF below.
  const pkg = {
    stage: stage === "planning" || stage === "active" ? stage : undefined,
    audience: audience === "child" || audience === "self" ? audience : undefined,
    careers: Array.isArray(careers) ? careers.filter((s) => typeof s === "string").slice(0, 5) : [],
  };
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
    // New leads get the 10% Founding Subscriber Discount (a unique code minted
    // off STRIPE_FOUNDING_COUPON_ID, which points at the 10% coupon); FOUNDING10
    // is the shared fallback. The old 20% coupon (PARENT20 and any codes minted
    // off STRIPE_LEAD_COUPON_ID) stays valid in Stripe for anyone who already
    // has it — this only changes what new codes are minted against.
    const code = (await mintLeadPromoCode(expiresDays)) ?? "FOUNDING10";
    const resend = new Resend(apiKey);
    try {
      if (pkg.stage) {
        // The Career Map capture: assemble and deliver the full package —
        // index + the stage/voice guide + overview + the chosen career
        // breakdowns (sampler PDF where one exists, else the on-site page).
        const stage = pkg.stage;
        const voice = pkg.audience === "self" ? "student" : "parent";
        const items = [
          {
            name: "The Career Index — all 28 careers",
            url: `${SITE.url}/api/sampler-pdf?s=index`,
            sub: "Every career scored, safest to most exposed.",
            cta: "Download PDF",
          },
          {
            name:
              stage === "planning"
                ? "Your guide — choosing a path that lasts"
                : "Your guide — protecting your value",
            url: `${SITE.url}/api/pack-pdf?doc=guide-${stage}-${voice}`,
            sub:
              stage === "planning"
                ? "The six moves for choosing well, plus a pre-decision checklist."
                : "The six moves for protecting value, plus a right-now checklist.",
            cta: "Download PDF",
          },
          {
            name: "What’s next — your map",
            url: `${SITE.url}/api/pack-pdf?doc=overview-${stage}-${voice}`,
            sub: "How the pieces fit, and the one thing to do next.",
            cta: "Download PDF",
          },
          ...pkg.careers.map((s) => {
            const c = getCareer(s);
            const has = hasSamplerPage(s);
            return {
              name: `${c?.name ?? s} — the free read`,
              url: has ? `${SITE.url}/api/sampler-pdf?s=${s}` : `${SITE.url}/careers/${s}`,
              sub: "See where the safe and exposed tracks sit — a first look at the split.",
              cta: has ? "Download PDF" : "Read online",
            };
          }),
        ];
        const { html, text } = packageEmail({
          items,
          code,
          discountLabel: "10% off",
          expiresDays,
          buyUrl: `${SITE.url}/buy`,
          audience: pkg.audience,
          careerNames: pkg.careers.map((s) => getCareer(s)?.name ?? s),
        });
        await resend.emails.send({
          from,
          to: email,
          subject: "Your Career Map (index + guide + reads)",
          html,
          text,
        });
      } else {
        const { html, text } = pdfWelcomeEmail({
          pdfUrl,
          pdfLabel,
          code,
          discountLabel: "10% off",
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
      }
    } catch {
      /* delivery is best-effort — the address is already on the list */
    }

    // Enrol the lead + fire the custom event that starts the matching nurture
    // automation. Fork by where the lead is: the /map capture sends its stage,
    // so planning vs already-in each start their own Resend automation
    // (map_planning_requested / map_active_requested). Plain index/sampler
    // signups (no stage) keep their existing events.
    // NOTE: the Resend SDK returns { data, error } and does NOT throw on API
    // errors, so we branch on `error` — a bare try/catch only catches network
    // throws. We attach the discount code as a `promo_code` property, retrying a
    // plain add if that property isn't defined yet or the contact already
    // exists. Logged so we can see exactly what Resend returns. Best-effort:
    // nothing here ever blocks the already-saved signup.
    const nurtureEvent = pkg.stage
      ? pkg.stage === "planning"
        ? "map_planning_requested"
        : "map_active_requested"
      : slug === "index"
        ? "index_requested"
        : "sampler_requested";
    try {
      let contact = await resend.contacts.create({
        email,
        unsubscribed: false,
        properties: {
          promo_code: code,
          ...(pkg.stage ? { stage: pkg.stage } : {}),
          ...(pkg.audience ? { audience: pkg.audience } : {}),
          ...(pkg.careers.length ? { careers: pkg.careers.join(",") } : {}),
        },
      });
      if (contact.error) {
        contact = await resend.contacts.create({ email, unsubscribed: false });
      }
      const event = await resend.events.send({ event: nurtureEvent, email });
      if (contact.error || event.error) {
        console.error("[nurture] enrolment error", {
          nurtureEvent,
          contactError: contact.error ?? null,
          eventError: event.error ?? null,
        });
      }
    } catch (err) {
      console.error("[nurture] threw", String(err));
    }
  }

  return NextResponse.json({ ok: true });
}
