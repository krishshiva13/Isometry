// FactHub Progressive Web App Service Worker
const CACHE_NAME = 'facthub-quiz-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-caching partial failure, proceeding:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass chrome-extension and non-http(s) schemes
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API and Navigation with Network-First, fallback to Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache valid responses for offline use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache when offline
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation request fails, return cached index.html
        if (request.mode === 'navigate') {
          const indexCached = await caches.match('/');
          if (indexCached) {
            return indexCached;
          }
        }

        return new Response('Network error occurred and no cached content available.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
