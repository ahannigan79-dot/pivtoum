import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Countries where advertising trackers need prior opt-in consent (GDPR + UK PECR
 * + Swiss FADP): the EU, the wider EEA, the UK and Switzerland. Everywhere else
 * uses an opt-out model, so the pixel may load by default (subject to GPC).
 */
const CONSENT_REGION = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", "GB", "CH",
]);

// The member platform. Everything under /hub requires a signed-in member.
const isProtected = createRouteMatcher(["/hub(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;

  // Keep the existing basic-auth gate for /admin.
  if (path.startsWith("/admin")) {
    const pass = process.env.ADMIN_PASSWORD;
    if (!pass) return new NextResponse("Admin is not configured.", { status: 503 });
    const user = process.env.ADMIN_USER || "admin";
    const expected = "Basic " + btoa(`${user}:${pass}`);
    if (req.headers.get("authorization") !== expected) {
      return new NextResponse("Authentication required.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Pivotum admin", charset="UTF-8"' },
      });
    }
  }

  // Gate the member platform.
  if (isProtected(req)) await auth.protect();

  // Tag the visitor's consent region for the client. Unknown country → treat as
  // consent-required, so a mis-detected EU visitor is never tracked by default.
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const region = country && !CONSENT_REGION.has(country) ? "open" : "eu";

  const res = NextResponse.next();
  res.cookies.set("pv_region", region, { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax", httpOnly: false });
  return res;
});

export const config = {
  matcher: [
    // Run on all pages except Next internals and static files…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|woff2?|ttf|map|txt|xml|webp|avif)).*)",
    // …and always on API routes (so Clerk auth() works in member handlers).
    "/(api)(.*)",
  ],
};
