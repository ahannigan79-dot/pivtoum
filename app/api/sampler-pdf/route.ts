import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { hasSamplerPage } from "@/content/careers/registry";

export const dynamic = "force-dynamic";

/**
 * Public redirect to a free PDF in Blob. `s` is a sampler slug or "index"
 * (all 28 scores). Free content, so no signed/expiring link — unlike the paid
 * profiles served via /api/download. Uploaded by /api/upload-samplers.
 *
 *   GET /api/sampler-pdf?s=veterinary
 */
export async function GET(req: Request) {
  const s = new URL(req.url).searchParams.get("s") ?? "index";
  const path =
    s === "index"
      ? "samplers/all-28-scores.pdf"
      : hasSamplerPage(s)
        ? `samplers/${s}.pdf`
        : null;
  if (!path) return new NextResponse("Not found", { status: 404 });

  const { blobs } = await list({ prefix: path, token: blobToken() });
  const pdf = blobs.find((b) => b.pathname === path);
  if (!pdf) return new NextResponse("That PDF isn’t available yet.", { status: 404 });

  return NextResponse.redirect(pdf.url, 302);
}
