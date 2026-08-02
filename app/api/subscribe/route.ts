import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

/**
 * Email capture for the next edition. Stored in Postgres (we own the list); if a
 * Substack publication is configured, the address is mirrored there too. The
 * mirror is best-effort and never blocks the signup.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: "" }));
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

  return NextResponse.json({ ok: true });
}
