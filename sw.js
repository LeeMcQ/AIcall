/* Sacred Wisdom – Service Worker v1.2 */
const CACHE_NAME = 'sacred-wisdom-v1.2';

/* Only cache the app shell – NOT model files (those are
   handled by WebLLM's own IndexedDB/Cache storage) */
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* ── INSTALL: cache app shell ── */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      /* addAll fails if any resource 404s, so add individually */
      return Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
});

/* ── ACTIVATE: delete old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: serve app shell from cache, pass model files through ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Let WebLLM CDN requests go straight to network –
     WebLLM caches these itself in its own Cache Storage bucket */
  if (
    url.hostname.includes('huggingface.co') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('esm.run') ||
    url.pathname.includes('.wasm') ||
    url.pathname.includes('.bin') ||
    url.pathname.includes('-shard')
  ) {
    return; /* browser handles normally */
  }

  /* For same-origin app shell requests: cache-first */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
