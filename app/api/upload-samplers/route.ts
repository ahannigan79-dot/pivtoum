import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { samplerSlugs } from "@/content/careers/registry";

export const dynamic = "force-dynamic";

/**
 * Upload the free sampler + index PDFs into Blob. Reads samplers-src/<slug>.pdf
 * and samplers-src/all-28-scores.pdf (committed, bundled via next.config
 * outputFileTracingIncludes) and stores them as samplers/<slug>.pdf and
 * samplers/all-28-scores.pdf. Gated by the signing secret, like upload-profiles.
 *
 *   GET /api/upload-samplers?key=<DOWNLOAD_SIGNING_SECRET>
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = blobToken();
  if (!token) return NextResponse.json({ error: "blob not configured" }, { status: 503 });

  const dir = path.join(process.cwd(), "samplers-src");
  // The Career Map package docs: the stage/voice guides and overviews the
  // /map capture delivers. Kept in sync with the allowlist in /api/pack-pdf.
  const packDocs = ["guide", "overview"].flatMap((k) =>
    ["planning", "active"].flatMap((s) => ["parent", "student"].map((v) => `${k}-${s}-${v}`)),
  );
  const targets = [
    ...samplerSlugs.map((slug) => ({ file: `${slug}.pdf`, dest: `samplers/${slug}.pdf` })),
    { file: "all-28-scores.pdf", dest: "samplers/all-28-scores.pdf" },
    ...packDocs.map((doc) => ({ file: `${doc}.pdf`, dest: `samplers/${doc}.pdf` })),
  ];

  const uploaded: string[] = [];
  const missing: string[] = [];
  for (const { file, dest } of targets) {
    let bytes: Buffer;
    try {
      bytes = await readFile(path.join(dir, file));
    } catch {
      missing.push(file);
      continue;
    }
    await put(dest, bytes, {
      access: "public",
      token,
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    uploaded.push(dest);
  }

  return NextResponse.json({ uploaded: uploaded.length, files: uploaded, missing });
}
