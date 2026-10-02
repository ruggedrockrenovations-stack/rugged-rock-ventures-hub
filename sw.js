/* Rugged Rock Ventures Hub — service worker.
   Exists so Chrome on Android treats the site as installable and fires
   beforeinstallprompt, which powers the one-tap "Install" button in the app.
   (iPhone Safari has no equivalent API, so iOS keeps the manual instructions.) */
const CACHE_NAME = 'rrv-hub-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['./', './index.html']))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
      return resp;
    }).catch(() =>
      caches.match(event.request).then((hit) => hit || caches.match('./index.html'))
    )
  );
});
