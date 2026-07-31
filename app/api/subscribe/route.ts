import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

/**
 * Email capture → Substack (primary), with a best-effort copy kept in our own
 * Postgres list so the /admin dashboard still sees every signup.
 *
 * Substack is posted server-side: the browser can't reach it reliably (CORS),
 * and the Meta `Lead` pixel event must only fire on a confirmed success. The
 * Substack response body is never forwarded to the client — it's mapped to a
 * generic message. The publication subdomain lives in SUBSTACK_PUBLICATION so
 * it can change without a code edit.
 *
 * Note: /api/v1/free is the endpoint Substack's own embed posts to; it is
 * unofficial and unauthenticated, and Substack may rate-limit or challenge
 * datacenter IPs. Failures are surfaced as a generic retry message.
 */
const PUBLICATION = process.env.SUBSTACK_PUBLICATION ?? "pivotum";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; source?: unknown; firstUrl?: unknown; currentUrl?: unknown }
    | null;

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const source = typeof body?.source === "string" ? body.source.slice(0, 120) : "site";
  const firstUrl = typeof body?.firstUrl === "string" ? body.firstUrl.slice(0, 500) : undefined;
  const currentUrl = typeof body?.currentUrl === "string" ? body.currentUrl.slice(0, 500) : undefined;

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const origin = `https://${PUBLICATION}.substack.com`;
  let substackOk = false;
  try {
    const res = await fetch(`${origin}/api/v1/free`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/`,
        "User-Agent": "Mozilla/5.0 (compatible; Pivotum/1.0; +https://www.pivotum.ai)",
      },
      body: JSON.stringify({
        email,
        source,
        first_url: firstUrl,
        current_url: currentUrl,
        referral_code: "",
        referring_pub_id: "",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    // Any 2xx — including the already-subscribed case — is a success to the user.
    substackOk = res.ok;
    if (!res.ok) console.error(`Substack subscribe failed for source=${source}: ${res.status}`);
  } catch (err) {
    console.error("Substack subscribe error", err);
  }

  // Best-effort mirror to our own list — never blocks or fails the signup.
  try {
    await addSubscriber(email);
  } catch {
    /* the Substack result is what the user sees */
  }

  if (!substackOk) {
    return NextResponse.json(
      { ok: false, error: "We couldn't complete that just now. Please try again." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
