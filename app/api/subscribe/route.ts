import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addSubscriber, recordAdConversion } from "@/lib/db";
import { getCareer } from "@/data/careers";
import { hasSamplerPage, hasStudyingVersion } from "@/content/careers/registry";
import { packageEmail, pdfWelcomeEmail } from "@/lib/emails";
import { verifyEmail } from "@/lib/email-validate";
import { mintLeadPromoCode } from "@/lib/stripe";
import { sendMetaLead } from "@/lib/capi";
import { derivePrimaryCluster } from "@/lib/clusters";
import { SITE } from "@/lib/site";

// The conversion action name Google Ads expects in the offline-import CSV; it
// must match an "import" conversion action created in the Ads account.
const GADS_IMPORT_NAME = process.env.GADS_IMPORT_CONVERSION_NAME ?? "Website signup (import)";

/**
 * Email capture. Stored in Postgres (we own the list) and mirrored to Substack
 * (best-effort). Then delivers the requested PDF — the sampler for the page they
 * were on, or all 28 scores — by email, with the subscriber discount. `source`
 * is a sampler slug or "index".
 */
export async function POST(req: Request) {
  const { email, firstName, source, stage, audience, careers, score, factors, band, bandPhrase, eventId, fbclid, gclid } = await req
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

  // Deliverability gate — the score reveals on submit, but the PDF + Community
  // guide + nurture land in the inbox, so we require an address that can receive
  // them. Blocks disposable domains and domains with no MX. A friendly 422 the
  // client shows without revealing; transient DNS blips fall through as valid.
  const verdict = await verifyEmail(email);
  if (!verdict.ok) {
    const error = verdict.reason === "disposable"
      ? "That looks like a temporary inbox — use a real email and we'll send your score, the 28-career index, and the community guide."
      : "That email doesn't look deliverable — pop in a real one and we'll send your score and the guide.";
    return NextResponse.json({ error }, { status: 422 });
  }

  // Their career picks define the cluster we route them to in the community —
  // most-picked wins (see lib/clusters). We store the routing fields on the
  // subscriber row so we own the data, not just Resend.
  const cluster = derivePrimaryCluster(pkg.careers).primary;
  const cleanName =
    typeof firstName === "string" && firstName.trim() ? firstName.trim().slice(0, 80) : null;
  try {
    await addSubscriber(email, {
      firstName: cleanName,
      cluster,
      stage: pkg.stage ?? null,
      audience: pkg.audience ?? null,
      careers: pkg.careers,
    });
  } catch {
    return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
  }

  // Fire the Lead conversion server-side (Meta Conversions API). The browser
  // pixel is blocked for most of our mobile / in-app-browser traffic, so this
  // server-to-server event is what actually reaches Meta. It shares eventId with
  // the browser pixel so Meta de-duplicates the ones that fire in both places,
  // and uses the fbclid + _fbp/_fbc cookies for attribution. Best-effort, and a
  // no-op until META_CAPI_TOKEN is set.
  {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const cookie = (n: string) => cookieHeader.match(new RegExp(`(?:^|;\\s*)${n}=([^;]+)`))?.[1];
    await sendMetaLead({
      email,
      eventId: typeof eventId === "string" ? eventId : undefined,
      eventSourceUrl: req.headers.get("referer") ?? `${SITE.url}/map`,
      fbclid: typeof fbclid === "string" ? fbclid : undefined,
      fbp: cookie("_fbp"),
      fbc: cookie("_fbc"),
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }

  // Record a Google Ads offline conversion when the signup came from a Google ad
  // (auto-tagged gclid). Exported later as a CSV that Google Ads pulls on a
  // schedule — server-side, so it survives the same mobile/in-app pixel blocking.
  // Best-effort.
  if (typeof gclid === "string" && gclid) {
    try {
      await recordAdConversion(gclid, GADS_IMPORT_NAME);
    } catch (err) {
      console.error("[gads] recordAdConversion failed", String(err));
    }
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
        // The Career Map capture. The free deliverable is now lean: the 28-score
        // index + a high-level review of each picked career (their career page,
        // where the review shows free and the deeper breakdown is gated). The
        // stage/voice guides and overviews have moved into the membership
        // library — they're no longer given away here.
        // NOTE: packageEmail's sell copy still frames the old à-la-carte Career
        // Value Guide + /buy. That copy is being rewritten to sell the community
        // (the Day 0 email pass) — pending the Mighty link.
        const items = [
          ...pkg.careers.map((s) => {
            const c = getCareer(s);
            // Point studiers at the studying voice of the Career Map when one exists.
            const studying = pkg.stage === "planning" && hasStudyingVersion(s);
            return {
              name: `Your ${c?.name ?? s} Career Map`,
              url: `${SITE.url}/careers/${s}${studying ? "/studying" : ""}`,
              sub: "Where the safe and exposed tracks sit, and the six factors that decide which is which.",
              cta: "Open your Career Map",
            };
          }),
          {
            name: "The Career Index — all 28 careers",
            url: `${SITE.url}/api/sampler-pdf?s=index`,
            sub: "Every career scored, safest to most exposed.",
            cta: "Download PDF",
          },
        ];
        // The score + 4 factors the on-page reveal showed, echoed into the email.
        const cleanScore = Number.isFinite(score) ? Math.max(1, Math.min(99, Math.round(Number(score)))) : null;
        const cleanFactors = Array.isArray(factors)
          ? factors
              .filter((f) => f && typeof f.label === "string" && (f.kind === "expose" || f.kind === "protect"))
              .slice(0, 4)
              .map((f) => ({ label: String(f.label).slice(0, 160), kind: f.kind as "expose" | "protect" }))
          : [];
        const { html, text } = packageEmail({
          items,
          code,
          discountLabel: "10% off",
          expiresDays,
          buyUrl: `${SITE.url}/buy`,
          audience: pkg.audience,
          careerNames: pkg.careers.map((s) => getCareer(s)?.name ?? s),
          score: cleanScore,
          factors: cleanFactors,
          band: typeof band === "string" ? band.slice(0, 40) : null,
          bandPhrase: typeof bandPhrase === "string" ? bandPhrase.slice(0, 120) : null,
          careerName: pkg.careers[0] ? getCareer(pkg.careers[0])?.name ?? null : null,
          communityUrl: `${SITE.url}/community`,
        });
        await resend.emails.send({
          from,
          to: email,
          subject: "Your Free Career Map is here",
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
