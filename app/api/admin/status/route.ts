import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { getStripe } from "@/lib/stripe";
import { billingConfigured, membershipConfigured } from "@/lib/billing";
import { aiConfigured } from "@/lib/ai";
import { pushConfigured } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only launch-readiness check. Founder-gated. Reports which env vars are
 * SET (booleans only — never the values), whether the schema is installed, and
 * pings Stripe to confirm the membership price is a live recurring price and to
 * list the webhook endpoints (so you can see one points at /api/webhook). Safe
 * to hit any time; it changes nothing.
 *
 *   GET /api/admin/status   (must be signed in as a FOUNDER_EMAILS account)
 */

const FALLBACK_FOUNDER = "ahannigan79@gmail.com";

function founderEmails(): string[] {
  const list = (process.env.FOUNDER_EMAILS ?? "")
    .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (!list.includes(FALLBACK_FOUNDER)) list.push(FALLBACK_FOUNDER);
  return list;
}

async function requireFounder() {
  const user = await currentUser();
  if (!user) return { ok: false as const, status: 401, error: "Not signed in." };
  const emails = (user.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  const allow = founderEmails();
  if (!emails.some((e) => allow.includes(e))) {
    return { ok: false as const, status: 403, error: "Not a founder account." };
  }
  return { ok: true as const };
}

const has = (k: string) => Boolean(process.env[k]);

export async function GET() {
  const gate = await requireFounder();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  // --- Env presence (booleans only; secret values are never returned) ---
  const env = {
    clerk: has("CLERK_SECRET_KEY") && has("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    postgres: has("POSTGRES_URL") || has("DATABASE_URL"),
    blob: has("BLOB_READ_WRITE_TOKEN"),
    stripeSecret: has("STRIPE_SECRET_KEY"),
    stripeMembershipPrice: has("STRIPE_MEMBERSHIP_PRICE_ID"),
    stripeWebhookSecret: has("STRIPE_WEBHOOK_SECRET"),
    trialDays: Number(process.env.STRIPE_MEMBERSHIP_TRIAL_DAYS ?? 0) || 0,
    cronSecret: has("CRON_SECRET"),
    anthropic: has("ANTHROPIC_API_KEY"),
    resend: has("RESEND_API_KEY") && has("EMAIL_FROM"),
    vapid: has("VAPID_PUBLIC_KEY") && has("VAPID_PRIVATE_KEY") && has("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
    founderEmails: has("FOUNDER_EMAILS"),
    // advertising (optional)
    metaCapiToken: has("META_CAPI_TOKEN"),
    gadsMemberLabel: has("NEXT_PUBLIC_GADS_MEMBER_LABEL"),
  };

  // --- Schema: is the base installed, and has the patch run? ---
  const schema: { installed: boolean; patchApplied: boolean; error: string | null } = {
    installed: false, patchApplied: false, error: null,
  };
  try {
    const r = await sql`
      select to_regclass('public.profiles') as base,
             to_regclass('public.workflow_transforms') as patch`;
    schema.installed = r.rows[0]?.base != null;
    schema.patchApplied = r.rows[0]?.patch != null;
  } catch (e) {
    schema.error = e instanceof Error ? e.message : String(e);
  }

  // --- Stripe: validate the membership price and list webhook endpoints ---
  const stripe: {
    billingConfigured: boolean;
    membershipConfigured: boolean;
    priceOk: boolean | null;
    price: { recurring: boolean; interval: string | null; amount: number | null; currency: string; active: boolean } | null;
    priceError: string | null;
    webhookEndpoints: { url: string; status: string; events: number; hasCheckoutCompleted: boolean }[] | null;
    webhookError: string | null;
  } = {
    billingConfigured: billingConfigured(),
    membershipConfigured: membershipConfigured(),
    priceOk: null, price: null, priceError: null,
    webhookEndpoints: null, webhookError: null,
  };

  if (membershipConfigured()) {
    try {
      const p = await getStripe().prices.retrieve(process.env.STRIPE_MEMBERSHIP_PRICE_ID!);
      stripe.priceOk = p.active === true && p.recurring != null;
      stripe.price = {
        recurring: p.recurring != null,
        interval: p.recurring?.interval ?? null,
        amount: p.unit_amount ?? null,
        currency: p.currency,
        active: p.active,
      };
    } catch (e) {
      stripe.priceOk = false;
      stripe.priceError = e instanceof Error ? e.message : String(e);
    }
  }

  if (billingConfigured()) {
    try {
      const eps = await getStripe().webhookEndpoints.list({ limit: 10 });
      stripe.webhookEndpoints = eps.data.map((e) => ({
        url: e.url,
        status: e.status,
        events: e.enabled_events.length,
        hasCheckoutCompleted:
          e.enabled_events.includes("checkout.session.completed") ||
          e.enabled_events.includes("*"),
      }));
    } catch (e) {
      stripe.webhookError = e instanceof Error ? e.message : String(e);
    }
  }

  // --- Overall: the minimum for the paid community to work end-to-end ---
  const ready = Boolean(
    env.clerk && env.postgres && env.stripeSecret && env.stripeMembershipPrice &&
    env.stripeWebhookSecret && schema.installed && schema.patchApplied && stripe.priceOk,
  );

  const blockers: string[] = [];
  if (!env.clerk) blockers.push("Clerk keys not set");
  if (!env.postgres) blockers.push("POSTGRES_URL not set");
  if (!env.stripeSecret) blockers.push("STRIPE_SECRET_KEY not set");
  if (!env.stripeMembershipPrice) blockers.push("STRIPE_MEMBERSHIP_PRICE_ID not set");
  if (!env.stripeWebhookSecret) blockers.push("STRIPE_WEBHOOK_SECRET not set");
  if (!schema.installed) blockers.push("Schema not installed — POST /api/admin/migrate (header x-migrate-confirm: RESET-SCHEMA)");
  else if (!schema.patchApplied) blockers.push("Patch not applied — GET /api/admin/migrate?patch=1");
  if (env.stripeMembershipPrice && stripe.priceOk === false) blockers.push("STRIPE_MEMBERSHIP_PRICE_ID is not a live recurring price");

  const warnings: string[] = [];
  if (!env.cronSecret) warnings.push("CRON_SECRET not set — scheduled jobs return 503");
  if (!env.anthropic) warnings.push("ANTHROPIC_API_KEY not set — AI features no-op");
  if (!env.resend) warnings.push("RESEND_API_KEY / EMAIL_FROM not set — no email sends");
  if (!env.vapid) warnings.push("VAPID keys not set — push notifications off");
  if (!env.founderEmails) warnings.push("FOUNDER_EMAILS not set — relying on the fallback founder");
  if (!env.metaCapiToken) warnings.push("META_CAPI_TOKEN not set — server-side Meta conversions off");
  if (!env.gadsMemberLabel) warnings.push("NEXT_PUBLIC_GADS_MEMBER_LABEL not set — member joins report under the purchase label");
  if (stripe.webhookEndpoints && !stripe.webhookEndpoints.some((w) => w.hasCheckoutCompleted)) {
    warnings.push("No Stripe webhook endpoint is subscribed to checkout.session.completed");
  }

  return NextResponse.json({
    ready,
    blockers,
    warnings,
    env,
    schema,
    ai: aiConfigured(),
    push: pushConfigured(),
    stripe,
  });
}
