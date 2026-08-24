import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

// Drizzle client bound to the existing Vercel Postgres store (POSTGRES_URL).
export const db = drizzle(sql, { schema });
export { schema };
