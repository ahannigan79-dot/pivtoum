import type { Metadata } from "next";
import { getAllOrders, type Order } from "@/lib/db";
import { getPack } from "@/lib/packs";
import { getCareer } from "@/data/careers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const priceCents = (size: number) => getPack(size)?.priceCents ?? 0;
const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;
const date = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace("T", " ");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "1rem 1.2rem", background: "#fff" }}>
      <div style={{ fontFamily: "var(--sans)", fontSize: ".62rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pencil)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 600, color: "var(--ink)", marginTop: ".2rem" }}>
        {value}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  let orders: Order[] = [];
  let error: string | null = null;
  try {
    orders = await getAllOrders();
  } catch (e) {
    error = (e as Error).message;
  }

  const revenue = orders.reduce((s, o) => s + priceCents(o.pack_size), 0);
  const claimed = orders.filter((o) => o.claimed).length;

  const packs = [1, 3, 5].map((size) => {
    const rows = orders.filter((o) => o.pack_size === size);
    return { size, count: rows.length, revenue: rows.reduce((s, o) => s + priceCents(o.pack_size), 0) };
  });

  const editions = new Map<string, { count: number; cents: number }>();
  for (const o of orders) {
    const e = editions.get(o.edition) ?? { count: 0, cents: 0 };
    e.count++;
    e.cents += priceCents(o.pack_size);
    editions.set(o.edition, e);
  }

  const profileCounts = new Map<string, number>();
  for (const o of orders) if (o.claimed) for (const slug of o.selected) profileCounts.set(slug, (profileCounts.get(slug) ?? 0) + 1);
  const profiles = [...profileCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, n]) => ({ name: getCareer(slug)?.name ?? slug, n }));

  const th: React.CSSProperties = {
    fontFamily: "var(--sans)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase",
    color: "var(--pencil)", textAlign: "left", padding: ".5rem .6rem", borderBottom: "1.5px solid var(--ink)",
  };
  const td: React.CSSProperties = {
    fontSize: ".9rem", padding: ".5rem .6rem", borderBottom: "1px solid var(--rule)", fontVariantNumeric: "tabular-nums",
  };

  return (
    <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "2rem 1.75rem 5rem" }}>
      <div style={{ fontFamily: "var(--sans)", fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--pen)", fontWeight: 600 }}>
        Pivotum · Admin
      </div>
      <h1 style={{ margin: ".4rem 0 1.6rem" }}>Sales &amp; orders</h1>

      {error ? (
        <p style={{ color: "var(--pen)" }}>Could not load orders: {error}</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(9rem,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            <Stat label="Orders" value={String(orders.length)} />
            <Stat label="Revenue" value={money(revenue)} />
            <Stat label="Claimed" value={`${claimed}/${orders.length}`} />
            <Stat label="Profiles delivered" value={String([...profileCounts.values()].reduce((a, b) => a + b, 0))} />
          </div>

          <h2 style={{ fontSize: "1.15rem" }}>By edition</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "0 0 2.5rem" }}>
            <thead><tr><th style={th}>Edition</th><th style={{ ...th, textAlign: "right" }}>Orders</th><th style={{ ...th, textAlign: "right" }}>Revenue</th></tr></thead>
            <tbody>
              {[...editions.entries()].map(([ed, v]) => (
                <tr key={ed}>
                  <td style={td}>{ed}</td>
                  <td style={{ ...td, textAlign: "right" }}>{v.count}</td>
                  <td style={{ ...td, textAlign: "right" }}>{money(v.cents)}</td>
                </tr>
              ))}
              {editions.size === 0 ? <tr><td style={td} colSpan={3}>No orders yet.</td></tr> : null}
            </tbody>
          </table>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem" }}>By pack</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Pack</th><th style={{ ...th, textAlign: "right" }}>Orders</th><th style={{ ...th, textAlign: "right" }}>Revenue</th></tr></thead>
                <tbody>
                  {packs.map((p) => (
                    <tr key={p.size}>
                      <td style={td}>{p.size} profile{p.size > 1 ? "s" : ""}</td>
                      <td style={{ ...td, textAlign: "right" }}>{p.count}</td>
                      <td style={{ ...td, textAlign: "right" }}>{money(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 style={{ fontSize: "1.15rem" }}>Most-claimed profiles</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Profile</th><th style={{ ...th, textAlign: "right" }}>Claims</th></tr></thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.name}><td style={td}>{p.name}</td><td style={{ ...td, textAlign: "right" }}>{p.n}</td></tr>
                  ))}
                  {profiles.length === 0 ? <tr><td style={td} colSpan={2}>None claimed yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>Recent orders</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>When</th><th style={th}>Email</th><th style={th}>Edition</th><th style={{ ...th, textAlign: "right" }}>Pack</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {orders.slice(0, 25).map((o) => (
                <tr key={o.token}>
                  <td style={td}>{date(o.created_at)}</td>
                  <td style={td}>{o.email}</td>
                  <td style={td}>{o.edition}</td>
                  <td style={{ ...td, textAlign: "right" }}>{o.pack_size}</td>
                  <td style={td}>{o.claimed ? "claimed" : "unclaimed"}</td>
                </tr>
              ))}
              {orders.length === 0 ? <tr><td style={td} colSpan={5}>No orders yet.</td></tr> : null}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
