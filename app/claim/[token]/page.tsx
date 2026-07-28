import Link from "next/link";
import { getOrder, upsertOrder, type Order } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { claimableCareers } from "@/lib/profiles";
import { careerRange } from "@/data/careers";
import { ClaimPicker } from "@/components/ClaimPicker";
import { ResendButton } from "@/components/ResendButton";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

async function loadOrder(token: string): Promise<Order | null> {
  const existing = await getOrder(token).catch(() => null);
  if (existing) return existing;
  // Webhook may not have landed yet — reconcile straight from Stripe.
  try {
    const session = await getStripe().checkout.sessions.retrieve(token);
    if (session.payment_status === "paid") {
      const email = session.customer_details?.email ?? session.customer_email ?? "";
      const packSize = Number(session.metadata?.pack_size ?? 0);
      if (email && packSize > 0) {
        await upsertOrder(token, email, packSize);
        return getOrder(token).catch(() => null);
      }
    }
  } catch {
    /* invalid token */
  }
  return null;
}

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await loadOrder(token);

  const choices = claimableCareers().map((c) => {
    const { safest, exposed } = careerRange(c);
    return {
      slug: c.slug,
      name: c.name,
      range: safest === exposed ? safest.toFixed(1) : `${safest.toFixed(1)}–${exposed.toFixed(1)}`,
    };
  });

  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Your profiles</span>
        </div>

        {!order ? (
          <>
            <h1>Finalizing your order…</h1>
            <p className="kicker">
              We&rsquo;re confirming your payment. Refresh this page in a few seconds — the link is
              safe to bookmark and come back to.
            </p>
          </>
        ) : order.claimed ? (
          <>
            <h1>Your profiles are on their way</h1>
            <p className="kicker">
              We emailed {order.selected.length} profile(s) to <strong>{order.email}</strong>. Links
              are valid for 7 days. Need them again?
            </p>
            <ResendButton token={token} />
          </>
        ) : (
          <>
            <h1>Choose your {order.pack_size} profile{order.pack_size > 1 ? "s" : ""}</h1>
            <p className="kicker">
              Payment received. Pick exactly {order.pack_size} — we&rsquo;ll email the PDFs to{" "}
              <strong>{order.email}</strong>. You can come back to this page until you claim.
            </p>
            <ClaimPicker token={token} packSize={order.pack_size} choices={choices} />
          </>
        )}

        <SiteFooter />
      </div>
    </div>
  );
}
