/**
 * Find the Vercel Blob read/write token. Defaults to BLOB_READ_WRITE_TOKEN, but
 * falls back to any *BLOB*TOKEN* env var, since Vercel sometimes names the
 * variable with a store-specific prefix when connecting a store.
 */
export function blobTokenName(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "BLOB_READ_WRITE_TOKEN";
  return Object.keys(process.env).find((k) => /BLOB/i.test(k) && /TOKEN/i.test(k));
}

export function blobToken(): string | undefined {
  const name = blobTokenName();
  return name ? process.env[name] : undefined;
}

export type UploadedAttachment = { url: string; name: string; contentType: string; kind: "image" | "file" };

/** Upload post attachments (images/files) to Vercel Blob. Skips oversized/empty files. */
export async function uploadPostFiles(files: File[]): Promise<UploadedAttachment[]> {
  const valid = files.filter((f) => f && f.size > 0 && f.size <= 10 * 1024 * 1024).slice(0, 4);
  if (!valid.length) return [];
  const { put } = await import("@vercel/blob");
  const token = blobToken();
  const out: UploadedAttachment[] = [];
  for (const f of valid) {
    const safe = (f.name || "file").replace(/[^\w.\-]+/g, "_").slice(0, 80);
    const key = `posts/${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`;
    const res = await put(key, f, { access: "public", token, contentType: f.type || undefined });
    out.push({
      url: res.url, name: f.name || "file", contentType: f.type || "",
      kind: (f.type || "").startsWith("image/") ? "image" : "file",
    });
  }
  return out;
}
