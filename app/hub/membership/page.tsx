import { auth } from "@clerk/nextjs/server";
import { getMembership, getMembershipOffer, billingConfigured } from "@/lib/billing";
import { openPortal, startMembership } from "./actions";

export const metadata = { title: "Membership — Winning in the Age of AI" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active", trialing: "Free trial", past_due: "Payment past due",
  canceled: "Canceled", unpaid: "Unpaid", incomplete: "Incomplete", incomplete_expired: "Expired",
  paused: "Paused",
};

const PERKS = [
  "Your AI Career Map — exposure scored, re-scored as the field moves",
  "Your Together pod — a small group holding you accountable",
  "Live events, clinics, and the weekly prompt",
  "Every lever, tool, and field signal in the Library",
];

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
}

export default async function MembershipPage({ searchParams }: { searchParams: Promise<{ portal?: string; checkout?: string; welcome?: string }> }) {
  const { userId } = await auth();
  const { portal, checkout, welcome } = await searchParams;
  const [m, offer] = await Promise.all([
    userId ? getMembership(userId) : Promise.resolve(null),
    getMembershipOffer(),
  ]);
  const showCurrent = m?.linked || m?.active;

  const statusCls = m?.active ? "ok" : m?.cancelHint ? "bad" : "neutral";
  const statusText = m?.status ? (STATUS_LABEL[m.status] ?? m.status) : "No subscription found";

  return (
    <>
      <div className="hub-top"><h1>Membership</h1><span className="sp" /></div>
      <div className="hub-body" style={{ maxWidth: 640 }}>
        {welcome && <p className="mbr-note ok">You&apos;re in — welcome to the community. 🎉 Your membership is active.</p>}
        {portal === "unavailable" && (
          <p className="mbr-note warn">We couldn&apos;t open the billing portal — we don&apos;t have a subscription linked to your account email yet. If you just joined, give it a minute and refresh, or message Adam.</p>
        )}
        {checkout === "unavailable" && (
          <p className="mbr-note warn">Checkout isn&apos;t available right now. Please try again in a moment, or message Adam.</p>
        )}

        {showCurrent ? (
          /* ── Current member ─────────────────────────────────────── */
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
        ) : !offer.configured || !billingConfigured() ? (
          <p className="feed-empty">Membership isn&apos;t open for sign-up here yet.</p>
        ) : (
          /* ── Join ───────────────────────────────────────────────── */
          <div className="mbr-card mbr-join">
            <p className="ck">Join the community</p>
            <h2>Winning in the Age of AI</h2>
            {offer.priceLabel && (
              <p className="mbr-price">{offer.priceLabel}
                {offer.trialDays > 0 && <span className="mbr-trial"> · {offer.trialDays}-day free trial</span>}
              </p>
            )}
            <ul className="mbr-perks">
              {PERKS.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <form action={startMembership} className="mbr-foot">
              <button type="submit" className="mbr-portal">
                {offer.trialDays > 0 ? `Start your ${offer.trialDays}-day free trial →` : "Start your membership →"}
              </button>
            </form>
            <p className="mbr-fine">Secure checkout by Stripe. Cancel anytime from your membership page.</p>
          </div>
        )}
      </div>
    </>
  );
}
