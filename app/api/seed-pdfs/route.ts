import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobToken } from "@/lib/blob";
import { getCareer } from "@/data/careers";
import { claimableCareers } from "@/lib/profiles";
import { makePlaceholderPdf } from "@/lib/placeholder-pdf";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY: seed placeholder profile PDFs into Blob so the delivery flow can be
 * tested before the real PDFs exist. Gated by DOWNLOAD_SIGNING_SECRET.
 * Remove this route once real PDFs are uploaded.
 *
 *   GET /api/seed-pdfs?key=<DOWNLOAD_SIGNING_SECRET>
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = blobToken();
  if (!token) return NextResponse.json({ error: "blob not configured" }, { status: 503 });

  const seeded: { slug: string; pathname: string }[] = [];
  for (const career of claimableCareers()) {
    const name = getCareer(career.slug)?.name ?? career.slug;
    const pdf = makePlaceholderPdf(`${name} — Full Profile (PLACEHOLDER)`);
    const { pathname } = await put(`profiles/${career.slug}.pdf`, pdf, {
      access: "public",
      token,
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    seeded.push({ slug: career.slug, pathname });
  }

  return NextResponse.json({ seeded });
}
