import { NextResponse } from "next/server";

/**
 * Bearer-token authorization for cron and admin-utility routes. The secret is
 * read ONLY from the `Authorization: Bearer <secret>` header — never from a URL
 * query string. A `?key=<secret>` param leaks the secret into server/proxy
 * access logs, browser history, and outbound `Referer` headers, so it is no
 * longer accepted. Fails closed when the env var is unset, so a route can never
 * fire publicly if it is misconfigured.
 *
 * Vercel Cron already sends `Authorization: Bearer ${CRON_SECRET}`, so scheduled
 * runs are unaffected. Manual runs must pass the header, e.g.
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/cron/digest
 *
 * Returns null when the request is authorized, or the NextResponse to return
 * immediately when it is not.
 */
export function requireBearer(req: Request, envKey: string): NextResponse | null {
  const secret = process.env[envKey];
  if (!secret) return NextResponse.json({ error: `${envKey} not configured` }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
