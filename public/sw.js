const CACHE_STATIC = 'catatjahit-static-v3';
const CACHE_PAGES  = 'catatjahit-pages-v3';

const PRECACHE_URLS = [
  '/',
  '/beranda',
  '/order',
  '/pelanggan',
  '/layanan',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_PAGES)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    /\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/.test(url.pathname)
  );
}

function isApiOrSupabase(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase')
  );
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }
  if (isApiOrSupabase(url)) {
    return;
  }
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      caches.open(CACHE_PAGES).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_STATIC).then((cache) =>
            cache.put(event.request, response.clone())
          );
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
