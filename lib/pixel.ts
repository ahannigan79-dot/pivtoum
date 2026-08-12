/**
 * Meta (Facebook) Pixel helpers. The pixel only loads when
 * NEXT_PUBLIC_META_PIXEL_ID is set, so the site runs identically with or
 * without it configured.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "2688950424011995";

type PixelParams = Record<string, unknown>;

/**
 * Fire a Meta Pixel standard event. No-op on the server or before the pixel
 * loads. Pass `eventId` to de-duplicate against the same event sent server-side
 * via the Conversions API (Meta drops the duplicate that shares event_name +
 * eventID).
 */
export function trackPixel(event: string, params?: PixelParams, eventId?: string): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}
