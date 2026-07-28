import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { verifyDownload } from "@/lib/download";
import { blobToken } from "@/lib/blob";

/**
 * Gate a Blob PDF behind a signed, 7-day link. PDFs live in the Blob store as
 * profiles/<slug>-parent.pdf and profiles/<slug>-student.pdf, uploaded by
 * /api/upload-profiles.
 */
export async function GET(req: Request) {
  const d = new URL(req.url).searchParams.get("d");
  if (!d) return new NextResponse("Missing token", { status: 400 });

  const verified = verifyDownload(d);
  if (!verified) return new NextResponse("This link is invalid or has expired.", { status: 403 });

  const path = `profiles/${verified.slug}-${verified.kind}.pdf`;
  const { blobs } = await list({ prefix: path, token: blobToken() });
  const pdf = blobs.find((b) => b.pathname === path);
  if (!pdf) return new NextResponse("Profile not found.", { status: 404 });

  return NextResponse.redirect(pdf.url, 302);
}
