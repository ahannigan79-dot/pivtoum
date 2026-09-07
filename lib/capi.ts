import crypto from "node:crypto";
import { META_PIXEL_ID } from "@/lib/pixel";

/**
 * Meta Conversions API — server-side Lead events.
 *
 * The browser pixel is blocked for most of our traffic (mobile Safari's tracking
 * prevention and the Facebook/Instagram in-app browsers strip third-party pixels),
 * so we also send the conversion server-to-server, which can't be blocked. The
 * browser pixel and this event share an `eventId` so Meta de-duplicates the ones
 * that do fire in both places.
 *
 * No-ops unless META_CAPI_TOKEN is set, so it ships safe and switches on the
 * moment the token is added in the environment.
 */
const GRAPH = "https://graph.facebook.com/v19.0";

const sha256 = (s: string) => crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

type MetaEventOpts = {
  email: string;
  eventId?: string;
  eventSourceUrl?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  /** Monetary value + currency, for events that carry one (e.g. Subscribe). */
  value?: number;
  currency?: string;
};

/** Send one server-side conversion to the Meta Conversions API. Shares its
 *  `eventId` with the browser pixel of the same name so Meta de-duplicates the
 *  ones that fire in both places. No-ops unless META_CAPI_TOKEN is set. */
async function sendMetaEvent(eventName: string, opts: MetaEventOpts): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !META_PIXEL_ID) return; // not configured — no-op

  // fbc (click id) is derived from the fbclid on the landing URL when the cookie
  // isn't present; format is fb.<subdomainIndex>.<createTimeMs>.<fbclid>.
  const fbc = opts.fbc || (opts.fbclid ? `fb.1.${Date.now()}.${opts.fbclid}` : undefined);

  const user_data: Record<string, unknown> = { em: [sha256(opts.email)] };
  if (fbc) user_data.fbc = fbc;
  if (opts.fbp) user_data.fbp = opts.fbp;
  if (opts.clientIp) user_data.client_ip_address = opts.clientIp;
  if (opts.userAgent) user_data.client_user_agent = opts.userAgent;

  const custom_data = opts.value != null
    ? { value: opts.value, currency: opts.currency ?? "USD" }
    : undefined;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: opts.eventSourceUrl,
        event_id: opts.eventId,
        user_data,
        ...(custom_data ? { custom_data } : {}),
      },
    ],
  };

  try {
    const res = await fetch(`${GRAPH}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[capi] Meta CAPI error", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[capi] Meta CAPI threw", String(err));
  }
}

/** Server-side Lead (email captured on the /map flow). */
export function sendMetaLead(opts: MetaEventOpts): Promise<void> {
  return sendMetaEvent("Lead", opts);
}

/** Server-side Subscribe (a member joined the community — fired from the Stripe
 *  webhook so it lands even when the browser pixel is blocked). */
export function sendMetaSubscribe(opts: MetaEventOpts): Promise<void> {
  return sendMetaEvent("Subscribe", opts);
}
