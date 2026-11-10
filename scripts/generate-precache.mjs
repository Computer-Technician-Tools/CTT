import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('build');
const urls = new Set(['/']);
const ignored = /(^|\/)(?:sw\.js|precache-manifest\.json|404\.html|search-index(?:-[^/]+)?\.json)$/i;
const textAssets = /\.(?:html|css|js|mjs|json|webmanifest|woff2?|ttf|otf)$/i;
const brandAssets = new Set([
  'img/logo.svg',
  'img/favicon.ico',
  'img/pwa-192.png',
  'img/pwa-512.png',
]);
const brandImage = relative => brandAssets.has(relative);
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).split(path.sep).join('/');
    if (entry.isDirectory()) await walk(full);
    else if ((textAssets.test(entry.name) || brandImage(relative)) && !ignored.test(relative)) {
      // Save documentation, app code, and CTT branding. Third-party favicons,
      // article images, and tool artwork are fetched only when visited online
      // and are deliberately omitted so the offline cache stays useful on slow links.
      if (/\.map$/i.test(entry.name)) continue;
      const stat = await import('node:fs/promises').then(({ stat }) => stat(full));
      if (stat.size <= 2 * 1024 * 1024) {
        urls.add(`/${relative}`);
        if (/\/index\.html$/i.test(relative)) urls.add(`/${relative.replace(/index\.html$/i, '')}`);
        else if (/\.html$/i.test(relative) && relative !== 'index.html') urls.add(`/${relative.replace(/\.html$/i, '')}`);
      }
    }
  }
}
await walk(root);
const priority = url => {
  if (['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/img/logo.svg', '/img/favicon.ico', '/img/pwa-192.png', '/img/pwa-512.png'].includes(url)) return 0;
  if (/\.html$|\/$/.test(url)) return 1;
  if (/\.css$/.test(url)) return 2;
  return 3;
};
await writeFile(path.join(root, 'precache-manifest.json'), JSON.stringify([...urls].sort((a, b) => priority(a) - priority(b) || a.localeCompare(b))));
// Stamp a unique cache version into the service worker so every deploy replaces
// the previous precache. Without this, sw.js is byte-identical between builds and
// browsers keep serving stale shell files.
const swPath = path.join(root, 'sw.js');
const versionLine = "const CACHE_VERSION = 'ctt-v2';";
const swSource = await readFile(swPath, 'utf8');
if (!swSource.includes(versionLine)) throw new Error('sw.js CACHE_VERSION line not found; update generate-precache.mjs to match.');
await writeFile(swPath, swSource.replace(versionLine, `const CACHE_VERSION = 'ctt-${Date.now().toString(36)}';`));

console.log(`Generated offline precache manifest with ${urls.size} URLs.`);
