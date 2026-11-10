(function () {
  'use strict';

  var storageKey = 'computer-technician-tools-theme';
  var themes = {
    'default': true,
    'catppuccin': true,
    'nord': true,
    'dracula': true,
    'TKOD': true,
    'Suprise': true,
    'amoled': true,
    'halloween': true,
    'christmas': true,
    'galaxy': true,
    'custom': true
  };

  try {
    var saved = null;
    try { saved = window.localStorage.getItem(storageKey); } catch (_) { /* Storage can be disabled. */ }
    var theme = themes[saved] ? saved : 'default';
    document.documentElement.setAttribute('data-tech-theme', theme);
  } catch (_) {
    document.documentElement.setAttribute('data-tech-theme', 'default');
  }
})();
