self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Jejak Hijau Warga", {
      body: payload.body ?? "Ada pembaruan baru untuk Anda.",
      icon: "/icon.svg",
      badge: "/badge.svg",
      data: {
        href: payload.href ?? "/notifikasi",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href ?? "/notifikasi";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(href);
          return client.focus();
        }
      }
      return clients.openWindow(href);
    }),
  );
});
