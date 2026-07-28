import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { claimableCareers } from "@/lib/profiles";
import { getCareer } from "@/data/careers";
import { headlineFlag } from "@/lib/tier";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Documents", robots: { index: false, follow: false } };

export default async function ProfilesPage() {
  let urls = new Map<string, string>();
  let error: string | null = null;
  try {
    const { blobs } = await list({ prefix: "profiles/", token: blobToken() });
    urls = new Map(blobs.map((b) => [b.pathname, b.url]));
  } catch (e) {
    error = (e as Error).message;
  }

  const rows = claimableCareers().map((c) => {
    const name = getCareer(c.slug)?.name ?? c.slug;
    return {
      name,
      score: c.headlineScore,
      safe: headlineFlag(c.headlineScore) === "safe",
      parent: urls.get(`profiles/${c.slug}-parent.pdf`) ?? null,
      student: urls.get(`profiles/${c.slug}-student.pdf`) ?? null,
    };
  });

  const th: React.CSSProperties = {
    fontFamily: "var(--sans)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase",
    color: "var(--pencil)", textAlign: "left", padding: ".5rem .6rem", borderBottom: "1.5px solid var(--ink)",
  };
  const td: React.CSSProperties = {
    fontSize: ".95rem", padding: ".55rem .6rem", borderBottom: "1px solid var(--rule)",
  };
  const linkStyle: React.CSSProperties = {
    fontFamily: "var(--sans)", fontSize: ".7rem", fontWeight: 600, letterSpacing: ".04em",
    textTransform: "uppercase", color: "var(--pen)", textDecoration: "none",
  };

  return (
    <div style={{ maxWidth: "60rem", margin: "0 auto", padding: "2rem 1.75rem 5rem" }}>
      <div style={{ fontFamily: "var(--sans)", fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--pen)", fontWeight: 600 }}>
        Pivotum · Admin
      </div>
      <h1 style={{ margin: ".4rem 0 .4rem" }}>Documents</h1>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 1.6rem" }}>
        Every live profile. <Link href="/admin" style={{ color: "var(--pen)" }}>← Sales &amp; orders</Link>
      </p>

      {error ? (
        <p style={{ color: "var(--pen)" }}>Could not load documents: {error}</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Career</th>
              <th style={{ ...th, textAlign: "right" }}>Score</th>
              <th style={{ ...th, textAlign: "right" }}>Parent</th>
              <th style={{ ...th, textAlign: "right" }}>Student</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={td}>{r.name}</td>
                <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", color: r.safe ? "var(--pen-safe)" : "var(--pen)", fontWeight: 600 }}>
                  {r.score.toFixed(1)}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {r.parent ? <a href={r.parent} target="_blank" rel="noreferrer" style={linkStyle}>View →</a> : <span style={{ color: "var(--pencil)", fontSize: ".8rem" }}>missing</span>}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {r.student ? <a href={r.student} target="_blank" rel="noreferrer" style={linkStyle}>View →</a> : <span style={{ color: "var(--pencil)", fontSize: ".8rem" }}>missing</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
