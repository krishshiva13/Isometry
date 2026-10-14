// FactHub Progressive Web App Service Worker
const CACHE_NAME = 'facthub-quiz-cache-v3';
const PRECACHE_URLS = [
  '/manifest.json',
  '/favicon.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-caching partial failure, proceeding:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', cacheName);
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

  // Bypass non-http(s) schemes
  if (!request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // CRITICAL: Completely bypass API routes and Admin panels from SW caching
  // This ensures /admin/daily-quiz, /admin/ai-creator, and /api/* are always live and never stuck on stale HTML
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return;
  }

  // For HTML page navigation (e.g. user navigating or refreshing a page), ALWAYS fetch network directly
  // Do NOT serve stale index.html which could contain outdated script chunk hashes!
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .catch(async () => {
          // Only when truly offline, fallback to cached index if available
          const indexCached = await caches.match('/index.html') || await caches.match('/');
          if (indexCached) {
            return indexCached;
          }
          return new Response('Offline: Please check your internet connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Handle static assets with Network-First, fallback to Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Only cache successful basic responses (do not cache 404s, 500s or redirects)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          // Do not cache HTML documents in asset cache
          const contentType = networkResponse.headers.get('content-type') || '';
          if (!contentType.includes('text/html')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Asset not available offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
