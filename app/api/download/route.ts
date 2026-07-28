import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { verifyDownload } from "@/lib/download";

/**
 * Gate a Blob PDF behind a signed, 7-day link. PDFs are uploaded to the Blob
 * store as profiles/<slug>.pdf by the separate (local) PDF pipeline.
 */
export async function GET(req: Request) {
  const d = new URL(req.url).searchParams.get("d");
  if (!d) return new NextResponse("Missing token", { status: 400 });

  const verified = verifyDownload(d);
  if (!verified) return new NextResponse("This link is invalid or has expired.", { status: 403 });

  const { blobs } = await list({ prefix: `profiles/${verified.slug}` });
  const pdf = blobs.find((b) => b.pathname.endsWith(".pdf"));
  if (!pdf) return new NextResponse("Profile not found.", { status: 404 });

  return NextResponse.redirect(pdf.url, 302);
}
