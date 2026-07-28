import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getOrder, markClaimed } from "@/lib/db";
import { isClaimable } from "@/lib/profiles";
import { getCareer } from "@/data/careers";
import { signDownload, SEVEN_DAYS_MS } from "@/lib/download";
import { purchaseEmail } from "@/lib/emails";
import { SITE } from "@/lib/site";

/**
 * Turn a selection into delivered PDFs. First claim requires a selection of
 * exactly pack_size; a claimed order re-issues its existing selection.
 */
export async function POST(req: Request) {
  const { token, slugs } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const order = await getOrder(token);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  let selected: string[];
  if (order.claimed) {
    selected = order.selected; // re-issue
  } else {
    selected = Array.isArray(slugs) ? [...new Set(slugs)] : [];
    if (selected.length !== order.pack_size) {
      return NextResponse.json(
        { error: `Choose exactly ${order.pack_size} profile(s).` },
        { status: 400 },
      );
    }
    if (!selected.every(isClaimable)) {
      return NextResponse.json({ error: "One or more selections are invalid." }, { status: 400 });
    }
  }

  const exp = Date.now() + SEVEN_DAYS_MS;
  const links = selected.map((slug) => ({
    name: getCareer(slug)?.name ?? slug,
    url: `${SITE.url}/api/download?d=${signDownload(slug, token, exp)}`,
  }));

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const emailConfigured = Boolean(apiKey && from);

  if (apiKey && from) {
    const resend = new Resend(apiKey);
    const { html, text } = purchaseEmail(links, token);
    const { error } = await resend.emails.send({
      from,
      to: order.email,
      subject: "Your Pivotum profiles",
      html,
      text,
    });
    if (error) return NextResponse.json({ error: "Could not send email." }, { status: 502 });
  }

  if (!order.claimed) await markClaimed(token, selected);

  // When email isn't wired up yet, hand the signed links straight back so the
  // flow is still testable. Once Resend is configured, delivery is by email only.
  return NextResponse.json({
    ok: true,
    delivered: links.length,
    email: order.email,
    emailed: emailConfigured,
    links: emailConfigured ? undefined : links,
  });
}
