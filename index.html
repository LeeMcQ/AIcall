/* Sacred Wisdom – Service Worker v1.3 – Full Offline */
const CACHE_NAME = 'sacred-wisdom-v1.3';

const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const CDN_PASSTHROUGH_CACHE = 'sacred-wisdom-cdn-v1.3';

const CDN_ORIGINS_TO_CACHE = [
  'esm.run',
  'cdn.jsdelivr.net',
  'esm.sh',
  'unpkg.com'
];

/* INSTALL */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(APP_SHELL.map(url => cache.add(url).catch(() => {})))
    )
  );
});

/* ACTIVATE */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CDN_PASSTHROUGH_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* FETCH */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip model weights - WebLLM manages those itself */
  if (
    url.pathname.includes('-shard') ||
    url.pathname.endsWith('.bin') ||
    url.pathname.endsWith('.wasm') ||
    url.pathname.includes('resolve/main') ||
    url.hostname === 'huggingface.co' ||
    url.hostname.endsWith('.hf.co')
  ) {
    return;
  }

  /* Cache CDN scripts (WebLLM runtime etc.) for offline use */
  const isCDN = CDN_ORIGINS_TO_CACHE.some(h => url.hostname.includes(h));
  if (isCDN) {
    event.respondWith(
      caches.open(CDN_PASSTHROUGH_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  /* Same-origin app shell: cache-first */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
