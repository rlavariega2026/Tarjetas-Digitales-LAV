const CACHE_NAME = 'lav-tarjetas-shell-v4';
const APP_SCOPE = '/tarjetas-digitales/';
const APP_START = APP_SCOPE;

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add(APP_START))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('lav-tarjetas-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate' && new URL(request.url).pathname.startsWith(APP_SCOPE)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match(APP_START)))
    );
  }
});
