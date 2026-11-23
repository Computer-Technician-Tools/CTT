// Register from a small deferred script so the homepage can install the PWA
// even before the Docusaurus application bundle finishes loading.
(function () {
  'use strict';

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    window.__cttPwaInstallPrompt = event;
    window.dispatchEvent(new Event('ctt-pwa-install-available'));
  });

  window.addEventListener('appinstalled', function () {
    window.__cttPwaInstalled = true;
    window.dispatchEvent(new Event('ctt-pwa-installed'));
  });

  if (!('serviceWorker' in navigator)) return;

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
})();
