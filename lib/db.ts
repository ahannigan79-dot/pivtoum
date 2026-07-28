import { sql } from "@vercel/postgres";

/**
 * Orders. One row per completed checkout, keyed by the Stripe Checkout Session
 * id (which is also the claim token). Re-visitable until claimed; re-issuable
 * after. `selected` holds the chosen career slugs once claimed.
 */
export interface Order {
  token: string;
  email: string;
  pack_size: number;
  claimed: boolean;
  selected: string[];
  created_at: string;
}

let ready = false;
export async function ensureSchema(): Promise<void> {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      token       TEXT PRIMARY KEY,
      email       TEXT NOT NULL,
      pack_size   INTEGER NOT NULL,
      claimed     BOOLEAN NOT NULL DEFAULT FALSE,
      selected    JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  ready = true;
}

export async function upsertOrder(token: string, email: string, packSize: number): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO orders (token, email, pack_size)
    VALUES (${token}, ${email}, ${packSize})
    ON CONFLICT (token) DO NOTHING;
  `;
}

export async function getOrder(token: string): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await sql<Order>`SELECT * FROM orders WHERE token = ${token} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function markClaimed(token: string, selected: string[]): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE orders
    SET claimed = TRUE, selected = ${JSON.stringify(selected)}::jsonb
    WHERE token = ${token};
  `;
}
