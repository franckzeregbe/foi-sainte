/* Service Worker — Église FOI SAINTE */
const CACHE_NAME = 'foisainte-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

/* ─── Web Push ─────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  let data = { title: 'Église FOI SAINTE', body: 'Nouveau message', icon: '/logo-foi-sainte.jpg', url: '/' };

  if (event.data) {
    try { data = { ...data, ...JSON.parse(event.data.text()) }; } catch { /* ignore */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo-foi-sainte.jpg',
      badge: data.badge || '/logo-foi-sainte.jpg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
