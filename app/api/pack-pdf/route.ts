import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { blobToken } from "@/lib/blob";

export const dynamic = "force-dynamic";

/**
 * Public redirect to a free AI Exposure Report package doc in Blob — the stage/voice
 * guides and overviews delivered by the /map capture. Allowlisted so the `doc`
 * param can't reach arbitrary Blob paths. Uploaded by /api/upload-samplers.
 * Free content, so no signed link (unlike the paid profiles via /api/download).
 *
 *   GET /api/pack-pdf?doc=guide-active-parent
 */
const STAGES = ["planning", "active"] as const;
const VOICES = ["parent", "student"] as const;
const KINDS = ["guide", "overview"] as const;

const PACK_DOCS: string[] = KINDS.flatMap((k) =>
  STAGES.flatMap((s) => VOICES.map((v) => `${k}-${s}-${v}`)),
);
const ALLOWED = new Set(PACK_DOCS);

export async function GET(req: Request) {
  const doc = new URL(req.url).searchParams.get("doc") ?? "";
  if (!ALLOWED.has(doc)) return new NextResponse("Not found", { status: 404 });

  const path = `samplers/${doc}.pdf`;
  const { blobs } = await list({ prefix: path, token: blobToken() });
  const pdf = blobs.find((b) => b.pathname === path);
  if (!pdf) return new NextResponse("That PDF isn’t available yet.", { status: 404 });

  return NextResponse.redirect(pdf.url, 302);
}
