import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Setup diagnostic for the storage layer. Confirms Postgres (creates the orders
 * table if missing) and Blob are reachable, and reports which env vars are
 * present (names only — never values). Safe to remove once commerce is verified.
 */
export async function GET() {
  const result: Record<string, unknown> = {};

  try {
    await ensureSchema();
    result.postgres = "ok";
  } catch (e) {
    result.postgres = "error";
    result.postgresReason = (e as Error).message.slice(0, 140);
  }

  try {
    await list({ limit: 1 });
    result.blob = "ok";
  } catch (e) {
    result.blob = "error";
    result.blobReason = (e as Error).message.slice(0, 140);
  }

  result.env = {
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };

  const ok = result.postgres === "ok" && result.blob === "ok";
  return NextResponse.json(result, { status: ok ? 200 : 503 });
}
