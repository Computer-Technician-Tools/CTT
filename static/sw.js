/* CTT offline-first service worker.
 * CACHE_VERSION is replaced with a unique build stamp by scripts/generate-precache.mjs. */
const CACHE_VERSION = 'ctt-v2';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const KEEP_CACHES = new Set([SHELL_CACHE, RUNTIME_CACHE]);
const PRECACHE_URL = '/precache-manifest.json';
const OFFLINE_URL = '/offline.html';
const MAX_RUNTIME_ENTRIES = 600;
const PRECACHE_CONCURRENCY = 4;
const CRITICAL_URLS = ['/', '/index.html', OFFLINE_URL, '/manifest.webmanifest', '/img/logo.svg', '/img/favicon.ico', '/img/pwa-192.png'];
let backgroundCachePromise;

function isCacheableRequest(request, url) {
  if (url.origin !== self.location.origin || request.method !== 'GET') return false;
  if (request.headers.has('authorization') || request.headers.has('range')) return false;
  if (request.cache === 'no-store') return false;
  if (request.mode === 'navigate') return true;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_')) return false;
  return request.destination !== '' || /\.(?:html|json|txt|xml|webmanifest)$/i.test(url.pathname);
}

function cacheResponseIsSafe(response) {
  return response.ok && response.type === 'basic' &&
    response.headers.get('cache-control')?.toLowerCase().includes('no-store') !== true &&
    response.headers.get('set-cookie') === null;
}

async function trimCache(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function notifyOffline() {
  const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
  clients.forEach((client) => client.postMessage({type: 'CTT_OFFLINE'}));
}

async function cacheRemainingSiteFiles() {
  const manifest = await fetch(PRECACHE_URL, {cache: 'no-store'});
  if (!manifest.ok) throw new Error('Could not load the offline file list.');
  const urls = await manifest.json();
  const cache = await caches.open(SHELL_CACHE);
  let next = 0;
  await Promise.all(Array.from({length: PRECACHE_CONCURRENCY}, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      if (typeof url !== 'string' || !url.startsWith('/')) continue;
      if (await cache.match(url)) continue;
      try {
        const response = await fetch(url, {cache: 'reload'});
        if (!cacheResponseIsSafe(response)) throw new Error(`Could not save ${url}`);
        await cache.put(url, response);
      } catch {
        notifyOffline();
        throw new Error(`Offline cache stopped at ${url}`);
      }
    }
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(CRITICAL_URLS.map(async (url) => {
      try {
        const response = await fetch(url, {cache: 'reload'});
        if (cacheResponseIsSafe(response)) await cache.put(url, response);
      } catch {
        // Keep existing branding and offline-screen entries during an offline update.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) =>
      (key.startsWith('ctt-') && !KEEP_CACHES.has(key)) || key === 'ctt-icons'
    ).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_SITE') {
    backgroundCachePromise ??= cacheRemainingSiteFiles().catch((error) => {
      console.warn('CTT background offline cache stopped early.', error);
      backgroundCachePromise = undefined;
    });
    event.waitUntil(backgroundCachePromise);
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/precache-manifest.json')) return;
  if (!isCacheableRequest(request, url)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request) || await cache.match(url.pathname) ||
        await cache.match(url.pathname.endsWith('/') ? `${url.pathname}index.html` : `${url.pathname}/index.html`);
      const networkUpdate = fetch(request).then(async (response) => {
        if (cacheResponseIsSafe(response)) await cache.put(request, response.clone());
        return response;
      }).catch((error) => {
        notifyOffline();
        throw error;
      });
      if (cached) {
        event.waitUntil(networkUpdate.catch(() => {}));
        return cached;
      }
      try {
        return await networkUpdate;
      } catch {
        return (await cache.match(OFFLINE_URL)) || new Response('You are offline. Continue with saved pages or reconnect and try again.', {
          status: 503,
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
        });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (cacheResponseIsSafe(response)) {
        const length = Number(response.headers.get('content-length') || 0);
        if (!length || length < 2 * 1024 * 1024) await cache.put(request, response.clone());
        await trimCache(cache, MAX_RUNTIME_ENTRIES);
      }
      return response;
    } catch {
      notifyOffline();
      return (await cache.match(request)) || Response.error();
    }
  })());
});
