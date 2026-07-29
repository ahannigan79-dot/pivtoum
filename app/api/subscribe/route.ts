import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

/**
 * Email capture for the next edition. Stored in Postgres (we own the list); if
 * Kit (ConvertKit) is also configured, the address is forwarded there too, but
 * Kit is optional and never blocks the signup.
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

  return NextResponse.json({ ok: true });
}
