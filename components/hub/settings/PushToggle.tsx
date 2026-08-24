"use client";
import { useEffect, useState } from "react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!VAPID) { setState("unconfigured"); return; }
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setState("unsupported"); return;
    }
    if (Notification.permission === "denied") { setState("denied"); return; }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "denied" : "off"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID!) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub),
      });
      setState(res.ok ? "on" : "off");
    } catch { setState("off"); } finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  const note =
    state === "unconfigured" ? "Push isn't set up on this site yet."
    : state === "unsupported" ? "This browser can't do push. On iPhone, add the app to your Home Screen first."
    : state === "denied" ? "Notifications are blocked for this site in your browser settings."
    : null;

  return (
    <div className="pref-row pref-select">
      <span>
        <b>Push notifications</b>
        <small>Get replies, messages and new credentials on your lock screen — on this device.{note ? ` ${note}` : ""}</small>
      </span>
      {state === "on" ? (
        <button type="button" className="push-btn on" disabled={busy} onClick={disable}>{busy ? "…" : "Turn off"}</button>
      ) : state === "off" ? (
        <button type="button" className="push-btn" disabled={busy} onClick={enable}>{busy ? "…" : "Enable"}</button>
      ) : (
        <button type="button" className="push-btn" disabled>—</button>
      )}
    </div>
  );
}
