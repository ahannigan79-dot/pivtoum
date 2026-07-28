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
