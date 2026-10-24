// SiDesKu Web Push & Notification Service Worker
// Standard W3C Push API & Notifications API (Rp0 Operational Cost)

// PWA Lifecycle: install & activate
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// PWA Installability Requirement: fetch event listener
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'SiDesKu - Notifikasi Desa';
  const options = {
    body: data.body || 'Ada pembaruan pelayanan desa untuk Anda.',
    icon: data.icon || '/logo-kediri.png',
    badge: data.badge || '/favicon.svg',
    data: {
      url: data.url || '/dashboard',
      timestamp: data.timestamp || Date.now(),
    },
    tag: data.tag || 'sidesku-notif',
    vibrate: [100, 50, 100],
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

