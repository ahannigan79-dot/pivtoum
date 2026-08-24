import { auth } from "@clerk/nextjs/server";
import { getMembership, billingConfigured } from "@/lib/billing";
import { openPortal } from "./actions";

export const metadata = { title: "Membership — Winning in the Age of AI" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active", trialing: "Free trial", past_due: "Payment past due",
  canceled: "Canceled", unpaid: "Unpaid", incomplete: "Incomplete", incomplete_expired: "Expired",
  paused: "Paused",
};

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
}

export default async function MembershipPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const { userId } = await auth();
  const { portal } = await searchParams;
  const m = userId ? await getMembership(userId) : null;
  const configured = billingConfigured();

  const statusCls = m?.active ? "ok" : m?.cancelHint ? "bad" : "neutral";
  const statusText = m?.status ? (STATUS_LABEL[m.status] ?? m.status) : "No subscription found";

  return (
    <>
      <div className="hub-top"><h1>Membership</h1><span className="sp" /></div>
      <div className="hub-body" style={{ maxWidth: 640 }}>
        {portal === "unavailable" && (
          <p className="mbr-note warn">We couldn&apos;t open the billing portal — we don&apos;t have a subscription linked to your account email yet. If you just joined, give it a minute and refresh, or message Adam.</p>
        )}

        {!configured ? (
          <p className="feed-empty">Membership billing isn&apos;t connected yet.</p>
        ) : (
          <div className="mbr-card">
            <div className="mbr-head">
              <div>
                <p className="ck">Your membership</p>
                <h2>{m?.plan ?? "Winning in the Age of AI"}</h2>
              </div>
              <span className={"mbr-status " + statusCls}>{statusText}</span>
            </div>

            <dl className="mbr-facts">
              <div><dt>Status</dt><dd>{statusText}</dd></div>
              {m?.status === "canceled"
                ? <div><dt>Access ends</dt><dd>{fmtDate(m?.renewsAt ?? null)}</dd></div>
                : <div><dt>Renews</dt><dd>{fmtDate(m?.renewsAt ?? null)}</dd></div>}
            </dl>

            {m?.cancelHint && (
              <p className="mbr-note warn">There&apos;s something to sort out with your payment — open the portal to fix it and keep your access.</p>
            )}

            <form action={openPortal} className="mbr-foot">
              <button type="submit" className="mbr-portal">Manage membership &amp; billing →</button>
            </form>
            <p className="mbr-fine">Invoices, payment method, and cancellation are handled securely by Stripe.</p>
          </div>
        )}
      </div>
    </>
  );
}
