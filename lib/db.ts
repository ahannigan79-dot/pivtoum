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
  acknowledged_at: string | null;
  /** Which stage guide the buyer claimed: "planning" or "active" (null on old orders). */
  stage: string | null;
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
  // Postgres forbids bind parameters inside DDL DEFAULT clauses, so the trusted
  // EDITION constant is inlined as an escaped literal here (not via `sql`).
  const editionDefault = `'${EDITION.replace(/'/g, "''")}'`;
  await db().query(`
    CREATE TABLE IF NOT EXISTS orders (
      token       TEXT PRIMARY KEY,
      email       TEXT NOT NULL,
      pack_size   INTEGER NOT NULL,
      edition     TEXT NOT NULL DEFAULT ${editionDefault},
      claimed     BOOLEAN NOT NULL DEFAULT FALSE,
      selected    JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Add the column for tables created before edition tracking existed.
  await db().query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS edition TEXT NOT NULL DEFAULT ${editionDefault};`);
  // Records the pre-purchase acknowledgement (analysis-not-advice + immediate delivery).
  await db().query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;`);
  // Which stage guide the buyer claimed (planning/active), so re-sends match.
  await db().query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stage TEXT;`);
  // Newsletter / Career-Map sign-ups from the landing page. We capture the
  // routing fields here (first name + the cluster derived from their picks +
  // stage/audience) so we own the data that positions them in the community —
  // not just Resend contact properties.
  await db().query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      email       TEXT PRIMARY KEY,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db().query(`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS first_name TEXT;`);
  await db().query(`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS cluster TEXT;`);
  await db().query(`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS stage TEXT;`);
  await db().query(`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS audience TEXT;`);
  await db().query(`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS careers JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  // Ad conversions to feed back to Google Ads via offline conversion import.
  // One row per signup that arrived with a gclid; exported as a CSV that Google
  // Ads pulls on a schedule (server-side, so mobile/in-app pixel blocking can't
  // lose it). No PII — just the click id + a conversion name + time.
  await db().query(`
    CREATE TABLE IF NOT EXISTS ad_conversions (
      id          BIGSERIAL PRIMARY KEY,
      gclid       TEXT NOT NULL,
      name        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  ready = true;
}

export async function recordAdConversion(gclid: string, name: string): Promise<void> {
  await ensureSchema();
  await db().sql`INSERT INTO ad_conversions (gclid, name) VALUES (${gclid}, ${name});`;
}

export async function getAdConversions(
  sinceDays: number,
): Promise<{ gclid: string; name: string; created_at: string }[]> {
  await ensureSchema();
  const { rows } = await db().sql<{ gclid: string; name: string; created_at: string }>`
    SELECT gclid, name, created_at FROM ad_conversions
    WHERE created_at > NOW() - make_interval(days => ${sinceDays})
    ORDER BY created_at DESC;
  `;
  return rows;
}

export async function upsertOrder(
  token: string,
  email: string,
  packSize: number,
  edition: string,
  acknowledgedAt?: string | null,
): Promise<void> {
  await ensureSchema();
  await db().sql`
    INSERT INTO orders (token, email, pack_size, edition, acknowledged_at)
    VALUES (${token}, ${email}, ${packSize}, ${edition}, ${acknowledgedAt ?? null})
    ON CONFLICT (token) DO NOTHING;
  `;
}

export async function getOrder(token: string): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await db().sql<Order>`SELECT * FROM orders WHERE token = ${token} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function markClaimed(
  token: string,
  selected: string[],
  stage?: string | null,
): Promise<void> {
  await ensureSchema();
  await db().sql`
    UPDATE orders
    SET claimed = TRUE, selected = ${JSON.stringify(selected)}::jsonb, stage = ${stage ?? null}
    WHERE token = ${token};
  `;
}

export async function getAllOrders(): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await db().sql<Order>`SELECT * FROM orders ORDER BY created_at DESC;`;
  return rows;
}

export interface SubscriberDetails {
  firstName?: string | null;
  cluster?: string | null;
  stage?: string | null;
  audience?: string | null;
  careers?: string[];
}

/**
 * Add or enrich a subscriber. Email is the key; the optional routing details
 * (first name, derived cluster, stage, audience, career picks) are stored so we
 * can position them in the community. On a repeat signup we fill in any field
 * that's newly provided without clobbering existing data with nulls (COALESCE);
 * career picks are replaced when a non-empty set is provided.
 */
export async function addSubscriber(email: string, details?: SubscriberDetails): Promise<void> {
  await ensureSchema();
  const d = details ?? {};
  const careers = Array.isArray(d.careers) && d.careers.length ? d.careers : null;
  await db().sql`
    INSERT INTO subscribers (email, first_name, cluster, stage, audience, careers)
    VALUES (
      ${email.toLowerCase()},
      ${d.firstName ?? null},
      ${d.cluster ?? null},
      ${d.stage ?? null},
      ${d.audience ?? null},
      ${careers ? JSON.stringify(careers) : "[]"}::jsonb
    )
    ON CONFLICT (email) DO UPDATE SET
      first_name = COALESCE(EXCLUDED.first_name, subscribers.first_name),
      cluster    = COALESCE(EXCLUDED.cluster, subscribers.cluster),
      stage      = COALESCE(EXCLUDED.stage, subscribers.stage),
      audience   = COALESCE(EXCLUDED.audience, subscribers.audience),
      careers    = CASE
                     WHEN jsonb_array_length(EXCLUDED.careers) > 0 THEN EXCLUDED.careers
                     ELSE subscribers.careers
                   END;
  `;
}

export async function subscriberCount(): Promise<number> {
  await ensureSchema();
  const { rows } = await db().sql<{ n: number }>`SELECT COUNT(*)::int AS n FROM subscribers;`;
  return rows[0]?.n ?? 0;
}

export interface SubscriberRow {
  email: string;
  created_at: string;
  first_name: string | null;
  cluster: string | null;
  stage: string | null;
  audience: string | null;
  careers: string[];
}

export async function getAllSubscribers(): Promise<SubscriberRow[]> {
  await ensureSchema();
  const { rows } = await db().sql<SubscriberRow>`
    SELECT email, created_at, first_name, cluster, stage, audience, careers
    FROM subscribers ORDER BY created_at DESC;
  `;
  return rows;
}
