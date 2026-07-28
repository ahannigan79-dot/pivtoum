import crypto from "node:crypto";

/**
 * Time-limited, signed download links. Vercel Blob URLs are unguessable but
 * don't expire; we gate them behind /api/download with an HMAC token that does.
 */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!s) throw new Error("DOWNLOAD_SIGNING_SECRET is not set");
  return s;
}

/** Which of a career's two PDFs a link points at. */
export type ProfileKind = "parent" | "student";

export function signDownload(
  slug: string,
  kind: ProfileKind,
  token: string,
  expMs: number,
): string {
  const payload = `${slug}|${kind}|${token}|${expMs}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyDownload(
  d: string,
): { slug: string; kind: ProfileKind; token: string } | null {
  try {
    const decoded = Buffer.from(d, "base64url").toString("utf8");
    const [slug, kind, token, expStr, sig] = decoded.split("|");
    if (!slug || !kind || !token || !expStr || !sig) return null;
    if (kind !== "parent" && kind !== "student") return null;
    const expected = crypto
      .createHmac("sha256", secret())
      .update(`${slug}|${kind}|${token}|${expStr}`)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (Date.now() > Number(expStr)) return null;
    return { slug, kind, token };
  } catch {
    return null;
  }
}
