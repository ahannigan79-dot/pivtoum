import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { RESET_STATEMENTS, DDL_STATEMENTS, PATCH_STATEMENTS } from "@/db/ddl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* One-time schema installer that runs through the app's OWN Postgres
 * connection (POSTGRES_URL) — so the tables land in exactly the database the
 * app queries, with no chance of a wrong-branch mismatch.
 *
 *   GET  /api/admin/migrate          → diagnostics (which DB, does profiles exist)
 *   GET  /api/admin/migrate?run=1    → DROP + recreate the whole schema
 *
 * Gated to founders: the signed-in Clerk user's email must be in
 * FOUNDER_EMAILS (comma-separated), with a fallback to the account owner. */

const FALLBACK_FOUNDER = "ahannigan79@gmail.com";

function founderEmails(): string[] {
  const list = (process.env.FOUNDER_EMAILS ?? "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.includes(FALLBACK_FOUNDER)) list.push(FALLBACK_FOUNDER);
  return list;
}

function dbHost(): string {
  const url = process.env.POSTGRES_URL ?? "";
  try {
    const u = new URL(url.replace(/^postgres(ql)?:\/\//, "https://"));
    return `${u.hostname}${u.pathname}`; // host + /dbname, no credentials
  } catch {
    return url ? "(unparseable POSTGRES_URL)" : "(POSTGRES_URL not set)";
  }
}

async function requireFounder() {
  const user = await currentUser();
  if (!user) return { ok: false as const, status: 401, error: "Not signed in." };
  const emails = (user.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  const allow = founderEmails();
  if (!emails.some((e) => allow.includes(e))) {
    return { ok: false as const, status: 403, error: "Not a founder account." };
  }
  return { ok: true as const, email: emails[0] };
}

export async function GET(req: Request) {
  const gate = await requireFounder();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sp = new URL(req.url).searchParams;
  const run = sp.get("run");
  const patch = sp.get("patch");

  // Additive patch — safe, non-destructive. Adds new columns/tables only.
  if (patch === "1") {
    const done: string[] = [];
    try {
      for (const stmt of PATCH_STATEMENTS) {
        await sql.query(stmt);
        done.push(stmt.slice(0, 70).replace(/\s+/g, " "));
      }
    } catch (e) {
      return NextResponse.json(
        { ok: false, connectedTo: dbHost(), applied: done, error: e instanceof Error ? e.message : String(e) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, connectedTo: dbHost(), applied: done, message: "Patches applied (non-destructive). Reload the app." });
  }

  // Diagnostic view — safe, read-only.
  if (run !== "1") {
    let profilesExists = false;
    let dbError: string | null = null;
    try {
      const r = await sql`select to_regclass('public.profiles') as t`;
      profilesExists = r.rows[0]?.t != null;
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e);
    }
    return NextResponse.json({
      connectedTo: dbHost(),
      profilesTableExists: profilesExists,
      dbError,
      hint: profilesExists
        ? "Schema already present on this DB."
        : "Tables are missing on the DB the app talks to. Call this URL with ?run=1 to install the schema here.",
    });
  }

  // Destructive install — drops public schema and rebuilds. Safe: no data yet.
  const all = [...RESET_STATEMENTS, ...DDL_STATEMENTS];
  const done: string[] = [];
  try {
    for (const stmt of all) {
      await sql.query(stmt);
      done.push(stmt.slice(0, 60).replace(/\s+/g, " "));
    }
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        connectedTo: dbHost(),
        ranStatements: done.length,
        failedAt: done.length,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    connectedTo: dbHost(),
    ranStatements: done.length,
    message: "Schema installed on the app's own database. Reload /hub.",
  });
}
