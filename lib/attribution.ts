/**
 * Ad click-id capture for server-side conversions. When someone arrives from an
 * ad, the landing URL carries `gclid` (Google) and/or `fbclid` (Meta). The
 * browser pixels are blocked for most of our mobile / in-app-browser traffic, so
 * we stash these in first-party cookies on arrival and send them with the signup,
 * letting the server attribute the conversion via the Conversions API / offline
 * import — which can't be blocked.
 */
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Call on landing: persist any gclid/fbclid from the URL into first-party cookies. */
export function captureClickIds(): void {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search);
  for (const k of ["gclid", "fbclid"] as const) {
    const v = q.get(k);
    if (v) document.cookie = `pv_${k}=${encodeURIComponent(v)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  }
}

/** Read click ids at submit — URL first (freshest), then the stashed cookie. */
export function readClickIds(): { gclid?: string; fbclid?: string } {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const cookie = (n: string) =>
    document.cookie.match(new RegExp(`(?:^|;\\s*)${n}=([^;]+)`))?.[1];
  const pick = (urlKey: string, cookieKey: string) => {
    const v = q.get(urlKey) ?? (cookie(cookieKey) ? decodeURIComponent(cookie(cookieKey)!) : undefined);
    return v || undefined;
  };
  const out: { gclid?: string; fbclid?: string } = {};
  const gclid = pick("gclid", "pv_gclid");
  const fbclid = pick("fbclid", "pv_fbclid");
  if (gclid) out.gclid = gclid;
  if (fbclid) out.fbclid = fbclid;
  return out;
}
