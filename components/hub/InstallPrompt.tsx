"use client";
import { useEffect, useState } from "react";

/**
 * A small, branded nudge to install the hub as an app. Android/Chrome get the
 * native install via the captured beforeinstallprompt; iOS Safari (which has no
 * such event) gets the Share -> Add to Home Screen instruction. Hidden once the
 * app is already installed (standalone), and dismissible with a 30-day memory.
 */

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function recentlyDismissed(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    return Date.now() - Number(v) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone === true;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isIOSSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setPlatform("android");
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS never fires beforeinstallprompt — offer the manual instruction instead,
    // after a short beat so it doesn't slam in on first paint.
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isIOSSafari) t = setTimeout(() => { setPlatform("ios"); setShow(true); }, 1600);

    const onInstalled = () => setShow(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      if (t) clearTimeout(t);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch { /* ignore */ }
    setDeferred(null);
    dismiss();
  }

  if (!show || !platform) return null;

  return (
    <div className="pwa-install" role="dialog" aria-label="Install the app">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pwa-install-ic" src="/icons/icon-192.png" alt="" aria-hidden="true" />
      <div className="pwa-install-body">
        <b>Add Winning to your home screen</b>
        {platform === "android" ? (
          <span>Open it like an app — full screen, one tap, straight to your hub.</span>
        ) : (
          <span>Tap the Share button, then <b>Add to Home Screen</b> — it opens like an app.</span>
        )}
      </div>
      {platform === "android" && (
        <button type="button" className="pwa-install-go" onClick={install}>Install</button>
      )}
      <button type="button" className="pwa-install-x" onClick={dismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
