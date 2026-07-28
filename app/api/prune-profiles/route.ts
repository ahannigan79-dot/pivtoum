import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { claimableCareers } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/**
 * Delete orphaned files under profiles/ in Blob — anything that isn't a current
 * <slug>-parent.pdf / <slug>-student.pdf for a sellable career. Cleans up old
 * placeholders and stale files after an edition. Gated by the signing secret.
 *
 *   GET /api/prune-profiles?key=<DOWNLOAD_SIGNING_SECRET>          (dry run)
 *   GET /api/prune-profiles?key=<DOWNLOAD_SIGNING_SECRET>&apply=1  (delete)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = blobToken();
  if (!token) return NextResponse.json({ error: "blob not configured" }, { status: 503 });

  const valid = new Set<string>();
  for (const c of claimableCareers()) {
    valid.add(`profiles/${c.slug}-parent.pdf`);
    valid.add(`profiles/${c.slug}-student.pdf`);
  }

  const { blobs } = await list({ prefix: "profiles/", token });
  const orphans = blobs.filter((b) => !valid.has(b.pathname));

  const apply = url.searchParams.get("apply") === "1";
  if (apply && orphans.length) {
    await del(orphans.map((b) => b.url), { token });
  }

  return NextResponse.json({
    applied: apply,
    kept: blobs.length - orphans.length,
    orphans: orphans.map((b) => b.pathname),
  });
}
