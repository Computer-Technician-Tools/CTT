/*
 * Development servers must never be controlled by a service worker left over
 * from a production preview. A cached runtime paired with newly compiled page
 * chunks causes Webpack's "factory is undefined" error. This file only loads
 * in development and removes CTT's local service-worker state once.
 */
(() => {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;

  void (async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('ctt-'))
        .map((name) => caches.delete(name)),
    );
  })().catch(() => {
    // Cache cleanup is a development convenience; it must never break the page.
  });
})();
