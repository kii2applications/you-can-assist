/* Simplified Service Worker for Kii2Connect */
/* Handles Push Notifications only to avoid caching conflicts */

const CACHE_NAME = 'kii2connect-push-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete ALL old caches (especially 'kii2connect-v1' which cached broken paths)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log('SW: Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Push Event Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/lovable-uploads/d6feabf9-2ed6-480e-91b4-827b47d13167.png',
      badge: '/lovable-uploads/d6feabf9-2ed6-480e-91b4-827b47d13167.png',
      data: data.url || '/',
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'View' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Kii2Connect', options)
    );
  } catch (e) {
    console.error('Error parsing push data:', e);
  }
});

// Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
