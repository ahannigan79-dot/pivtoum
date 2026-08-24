/* Service worker for the Winning in the Age of AI PWA.
   Handles install/activate, lock-screen push, and notification clicks. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Passthrough fetch handler — required for installability; no caching so the
// community app is always fresh.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { /* ignore */ }
  const title = data.title || "Winning in the Age of AI";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "/hub" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/hub";
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if ("focus" in client) { try { await client.navigate(url); } catch (_) { /* ignore */ } return client.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
