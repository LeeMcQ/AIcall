/* Sacred Wisdom – Service Worker v2.0 – MediaPipe build */
const CACHE_NAME = 'sacred-wisdom-v2.0';
const CDN_CACHE  = 'sacred-wisdom-cdn-v2.0';

const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

/* CDN origins to cache for offline use */
const CDN_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      Promise.allSettled(APP_SHELL.map(u => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== CDN_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* Pass model binary files straight through — handled by app's IndexedDB cache */
  if (url.pathname.endsWith('.task') || url.pathname.endsWith('.bin') || url.pathname.endsWith('.wasm')) {
    return;
  }

  /* Cache CDN scripts (MediaPipe bundle, wasm loader) */
  const isCDN = CDN_HOSTS.some(h => url.hostname.includes(h));
  if (isCDN) {
    e.respondWith(
      caches.open(CDN_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  /* Same-origin app shell: cache-first */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
      })
    );
  }
});
