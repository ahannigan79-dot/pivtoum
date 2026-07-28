import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { claimableCareers } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/**
 * Upload the real profile PDFs into Blob. Reads profiles-src/<slug>-parent.pdf
 * and profiles-src/<slug>-student.pdf (committed to the repo, bundled into this
 * function via next.config outputFileTracingIncludes) and stores them as
 * profiles/<slug>-parent.pdf / profiles/<slug>-student.pdf. Gated by the
 * signing secret, same as the old seed route.
 *
 *   GET /api/upload-profiles?key=<DOWNLOAD_SIGNING_SECRET>
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = blobToken();
  if (!token) return NextResponse.json({ error: "blob not configured" }, { status: 503 });

  const dir = path.join(process.cwd(), "profiles-src");
  const uploaded: string[] = [];
  const missing: string[] = [];

  for (const career of claimableCareers()) {
    for (const kind of ["parent", "student"] as const) {
      const file = `${career.slug}-${kind}.pdf`;
      let bytes: Buffer;
      try {
        bytes = await readFile(path.join(dir, file));
      } catch {
        missing.push(file);
        continue;
      }
      await put(`profiles/${career.slug}-${kind}.pdf`, bytes, {
        access: "public",
        token,
        contentType: "application/pdf",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      uploaded.push(`profiles/${career.slug}-${kind}.pdf`);
    }
  }

  return NextResponse.json({ uploaded: uploaded.length, files: uploaded, missing });
}
