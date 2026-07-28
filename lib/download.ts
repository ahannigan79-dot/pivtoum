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

export function signDownload(slug: string, token: string, expMs: number): string {
  const payload = `${slug}|${token}|${expMs}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyDownload(d: string): { slug: string; token: string } | null {
  try {
    const decoded = Buffer.from(d, "base64url").toString("utf8");
    const [slug, token, expStr, sig] = decoded.split("|");
    if (!slug || !token || !expStr || !sig) return null;
    const expected = crypto
      .createHmac("sha256", secret())
      .update(`${slug}|${token}|${expStr}`)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (Date.now() > Number(expStr)) return null;
    return { slug, token };
  } catch {
    return null;
  }
}
