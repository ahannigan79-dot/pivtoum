import { createPool, type VercelPool } from "@vercel/postgres";
import { EDITION } from "@/lib/site";

/**
 * Orders. One row per completed checkout, keyed by the Stripe Checkout Session
 * id (which is also the claim token). Re-visitable until claimed; re-issuable
 * after. `selected` holds the chosen career slugs once claimed; `edition`
 * records which edition the purchase was for.
 */
export interface Order {
  token: string;
  email: string;
  pack_size: number;
  edition: string;
  claimed: boolean;
  selected: string[];
  created_at: string;
}

// Lazy pool so a missing connection string never breaks the build. Accepts
// either POSTGRES_URL (Vercel Postgres) or DATABASE_URL (Neon/marketplace).
let pool: VercelPool | null = null;
function db(): VercelPool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No Postgres connection string (POSTGRES_URL / DATABASE_URL)");
    pool = createPool({ connectionString });
  }
  return pool;
}

let ready = false;
export async function ensureSchema(): Promise<void> {
  if (ready) return;
  await db().sql`
    CREATE TABLE IF NOT EXISTS orders (
      token       TEXT PRIMARY KEY,
      email       TEXT NOT NULL,
      pack_size   INTEGER NOT NULL,
      edition     TEXT NOT NULL DEFAULT ${EDITION},
      claimed     BOOLEAN NOT NULL DEFAULT FALSE,
      selected    JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  // Add the column for tables created before edition tracking existed.
  await db().sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS edition TEXT NOT NULL DEFAULT ${EDITION};`;
  ready = true;
}

export async function upsertOrder(
  token: string,
  email: string,
  packSize: number,
  edition: string,
): Promise<void> {
  await ensureSchema();
  await db().sql`
    INSERT INTO orders (token, email, pack_size, edition)
    VALUES (${token}, ${email}, ${packSize}, ${edition})
    ON CONFLICT (token) DO NOTHING;
  `;
}

export async function getOrder(token: string): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await db().sql<Order>`SELECT * FROM orders WHERE token = ${token} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function markClaimed(token: string, selected: string[]): Promise<void> {
  await ensureSchema();
  await db().sql`
    UPDATE orders
    SET claimed = TRUE, selected = ${JSON.stringify(selected)}::jsonb
    WHERE token = ${token};
  `;
}

export async function getAllOrders(): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await db().sql<Order>`SELECT * FROM orders ORDER BY created_at DESC;`;
  return rows;
}
