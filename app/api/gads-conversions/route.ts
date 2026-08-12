import { getAdConversions } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Google Ads offline conversion import — CSV feed.
 *
 * Google Ads pulls this on a schedule (Goals → Conversions → Uploads →
 * schedule an HTTPS source) and imports one click conversion per row, keyed by
 * gclid. This is how Google finally counts the mobile / in-app-browser signups
 * whose browser tag is blocked. Re-emitting a rolling window is safe — Google
 * de-duplicates by gclid + conversion name + time.
 *
 *   GET /api/gads-conversions?key=<DOWNLOAD_SIGNING_SECRET>
 *
 * The "Conversion Name" column must match an import conversion action in the
 * Ads account (default "Website signup (import)", override with
 * GADS_IMPORT_CONVERSION_NAME). Times are UTC to match TimeZone=+0000.
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || key !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const rows = await getAdConversions(35).catch(() => []);
  const time = (iso: string) => new Date(iso).toISOString().slice(0, 19).replace("T", " ");
  const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

  const lines = [
    "Parameters:TimeZone=+0000",
    "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency",
    ...rows.map((r) => [cell(r.gclid), cell(r.name), time(r.created_at), "1", "USD"].join(",")),
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
