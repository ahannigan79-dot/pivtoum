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
 *   GET  /api/admin/migrate?patch=1  → additive, non-destructive column/table patches
 *   POST /api/admin/migrate          → DROP + recreate the whole schema (DESTRUCTIVE)
 *
 * The destructive reset is a POST that ALSO requires the custom header
 *   x-migrate-confirm: RESET-SCHEMA
 * A cross-origin page cannot set a custom header on a request (it would trip a
 * CORS preflight), so this cannot be triggered by a stray link, prefetch, or
 * CSRF form the way a bare GET could — which previously meant one wrong click
 * would `DROP SCHEMA public CASCADE` on production.
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

  // The destructive reset is no longer reachable by GET (a bare GET can be
  // triggered by a link/prefetch/CSRF and would wipe the database). Point the
  // caller at the guarded POST instead of silently doing nothing.
  if (run === "1") {
    return NextResponse.json(
      { error: "The destructive reset moved to POST for safety. Send: POST /api/admin/migrate with header 'x-migrate-confirm: RESET-SCHEMA'." },
      { status: 405 },
    );
  }

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
      ? "Schema already present on this DB. Use ?patch=1 to apply additive patches."
      : "Tables are missing. POST to this route (header x-migrate-confirm: RESET-SCHEMA) to install a fresh schema, then GET ?patch=1 for the later tables + seeds.",
  });
}

/** DESTRUCTIVE: drop the public schema and rebuild it from scratch. Founder
 *  session AND the custom confirmation header both required (see file header). */
export async function POST(req: Request) {
  const gate = await requireFounder();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  if (req.headers.get("x-migrate-confirm") !== "RESET-SCHEMA") {
    return NextResponse.json(
      { error: "Missing confirmation. Resend with header 'x-migrate-confirm: RESET-SCHEMA'. This drops and rebuilds the entire database." },
      { status: 428 },
    );
  }

  // Drops public schema and rebuilds. Destructive by design — intended only for
  // a fresh/empty database at install time.
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
    message: "Schema installed on the app's own database. Now GET ?patch=1 for the later tables + seeds, then reload /hub.",
  });
}
