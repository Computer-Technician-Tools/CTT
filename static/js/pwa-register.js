// Register from a small deferred script so the homepage can install the PWA
// even before the Docusaurus application bundle finishes loading.
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  window.setTimeout(function () {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).then(function (registration) {
      return navigator.serviceWorker.ready.then(function () {
        // Let the initial view settle before fetching documentation in the
        // background. The page remains usable if storage is unavailable.
        window.setTimeout(function () {
          if (navigator.onLine) {
            var activeWorker = registration.active || navigator.serviceWorker.controller;
            if (activeWorker) activeWorker.postMessage({ type: 'CACHE_SITE' });
          }
        }, 15000);
      });
    }).catch(function () {
      // Browsing remains available if this browser blocks service workers.
    });
  }, 2000);
})();
