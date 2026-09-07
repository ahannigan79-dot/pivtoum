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

// Signed-in gate. The member platform (/hub) and the admin area (/admin) both
// require a signed-in Clerk user; /admin additionally checks founder identity at
// the page level (requireFounderPageOr404) rather than a shared password — a
// shared Basic-Auth password gave no per-user identity, rotation, or lockout for
// customer PII + revenue.
const isProtected = createRouteMatcher(["/hub(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;

  // Gate the member platform and the admin area (sign-in required here; the
  // founder-only check runs in the /admin pages themselves).
  if (isProtected(req)) await auth.protect();

  // Tag the visitor's consent region for the client. Unknown country → treat as
  // consent-required, so a mis-detected EU visitor is never tracked by default.
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const region = country && !CONSENT_REGION.has(country) ? "open" : "eu";

  // Forward the path as a request header so the hub layout can gate per-route.
  const fwd = new Headers(req.headers);
  fwd.set("x-pathname", path);
  const res = NextResponse.next({ request: { headers: fwd } });
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
