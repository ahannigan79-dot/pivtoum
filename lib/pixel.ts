/**
 * Meta (Facebook) Pixel helpers. The pixel only loads when
 * NEXT_PUBLIC_META_PIXEL_ID is set, so the site runs identically with or
 * without it configured.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

type PixelParams = Record<string, unknown>;

/** Fire a Meta Pixel standard event. No-op on the server or before the pixel loads. */
export function trackPixel(event: string, params?: PixelParams): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}
