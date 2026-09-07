import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { claimableCareers } from "@/lib/profiles";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";

/**
 * Delete orphaned files under profiles/ in Blob — anything that isn't a current
 * <slug>-planning.pdf / <slug>-active.pdf for a sellable career. Cleans up old
 * placeholders and stale files after an edition. Gated by the signing secret.
 *
 *   curl -H "Authorization: Bearer $DOWNLOAD_SIGNING_SECRET" https://…/api/prune-profiles          (dry run)
 *   curl -H "Authorization: Bearer $DOWNLOAD_SIGNING_SECRET" https://…/api/prune-profiles?apply=1  (delete)
 */
export async function GET(req: Request) {
  const denied = requireBearer(req, "DOWNLOAD_SIGNING_SECRET");
  if (denied) return denied;
  const url = new URL(req.url);

  const token = blobToken();
  if (!token) return NextResponse.json({ error: "blob not configured" }, { status: 503 });

  const valid = new Set<string>();
  for (const c of claimableCareers()) {
    valid.add(`profiles/${c.slug}-planning.pdf`);
    valid.add(`profiles/${c.slug}-active.pdf`);
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
