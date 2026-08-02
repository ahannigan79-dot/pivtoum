import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

/**
 * Email capture for the next edition. Stored in Postgres (we own the list); if
 * Kit (ConvertKit) or a Substack publication is also configured, the address is
 * mirrored there too. Both mirrors are best-effort and never block the signup.
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

  // Optional mirror to Kit, best-effort — its failure doesn't fail the signup.
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (apiKey && formId) {
    try {
      await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, email }),
      });
    } catch {
      /* ignore — Postgres already has it */
    }
  }

  // Optional mirror to Substack, best-effort. Substack has no official API; this
  // posts to the same free-subscribe endpoint its own embed form uses, so it can
  // change without notice — its failure never fails the signup.
  const substack = process.env.SUBSTACK_PUBLICATION_URL;
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
