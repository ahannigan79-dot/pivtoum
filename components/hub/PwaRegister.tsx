"use client";
import { useEffect } from "react";

/** Registers the service worker so the hub is installable and can receive push. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* best-effort */ });
  }, []);
  return null;
}
