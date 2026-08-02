import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Countries where advertising trackers need prior opt-in consent (GDPR + UK PECR
 * + Swiss FADP): the EU, the wider EEA, the UK and Switzerland. Everywhere else
 * uses an opt-out model, so the pixel may load by default (subject to GPC).
 */
const CONSENT_REGION = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EEA (non-EU)
  "IS", "LI", "NO",
  // UK + Switzerland
  "GB", "CH",
]);

export function middleware(req: NextRequest) {
  // Keep the existing basic-auth gate for /admin.
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const pass = process.env.ADMIN_PASSWORD;
    if (!pass) {
      return new NextResponse("Admin is not configured.", { status: 503 });
    }
    const user = process.env.ADMIN_USER || "admin";
    const expected = "Basic " + btoa(`${user}:${pass}`);
    if (req.headers.get("authorization") !== expected) {
      return new NextResponse("Authentication required.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Pivotum admin", charset="UTF-8"' },
      });
    }
  }

  // Tag the visitor's consent region for the client. Unknown country → treat as
  // consent-required, so a mis-detected EU visitor is never tracked by default.
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const region = country && !CONSENT_REGION.has(country) ? "open" : "eu";

  const res = NextResponse.next();
  res.cookies.set("pv_region", region, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}

export const config = {
  // Run on page routes (to set the region cookie) and /admin (auth); skip API,
  // Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
