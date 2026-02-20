const CACHE_NAME = 'physics-pwa-v1';
const URLS = [
  './',
  './index.html',
  './physics_data.js',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.url.startsWith('http') && !e.request.url.startsWith(self.location.origin)) {
    return;
  }
  var isNav = e.request.mode === 'navigate';
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.status === 200 && r.type === 'basic') {
        var clone = r.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        if (isNav) {
          return caches.match(new URL('index.html', self.location.origin).href);
        }
        return undefined;
      });
    })
  );
});
