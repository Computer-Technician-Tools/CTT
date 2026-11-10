/**
 * Build-time cache for every third-party icon CTT uses, so the site works offline.
 *
 * Sources
 *   Favicons (SourceBadge website icons)
 *     icon.horse, Google, allesedv.com, DuckDuckGo, Yandex
 *   Tool icons (<ToolIcon name="..."/> in docs)
 *     hl-<slug>  Dashboard Icons (homarr-labs/dashboard-icons, via jsDelivr)
 *     sh-<slug>  selfh.st icons (selfhst/icons, via jsDelivr)
 *     mdi-<slug> Material Design Icons (@iconify-json/mdi, local package)
 *     si-<slug>  Simple Icons (@iconify-json/simple-icons, local package)
 *   SimpleIcon (SourceBadge brand icons)
 *     cdn.simpleicons.org/<slug>, served from the local simple-icons package
 *
 * Modes
 *   default          only icons referenced in docs and components (keeps the
 *                    service worker's precache small)
 *   CTT_ICONS=all    every icon in the Dashboard Icons, selfh.st, MDI and
 *                    Simple Icons sets
 *
 * Network failures never fail the build. Anything not saved falls back to the
 * live URL at runtime, and the browser caches it once you reconnect.
 *
 * Writes src/generated/external-assets.ts, which maps each remote key to its
 * local copy.
 */
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');
const componentsDir = path.join(root, 'src/components');
const faviconDir = path.join(root, 'static/img/favicons');
const faviconManifestPath = path.join(faviconDir, 'manifest.json');
const faviconFailuresPath = path.join(root, '.tmp', 'favicon-download-failures.json');
const target = path.join(root, 'src/generated/external-assets.ts');
const ALL = process.env.CTT_ICONS === 'all';

const REQUEST_TIMEOUT_MS = 15000;
const CONCURRENCY = 4;
const MAX_BYTES = 512 * 1024;
// Do not make every `npm run start` wait on hosts that were already unavailable.
// A manual refresh, or a new day, retries them after connectivity is restored.
const FAILURE_RETRY_MS = 24 * 60 * 60 * 1000;
const EXTENSIONS = {
  'image/png': 'png',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

// Favicon services. Each builder must match the URL SourceBadge requests at runtime.
const FAVICON_PROVIDERS = [
  (host) => `https://icon.horse/icon/${host}`,
  (host) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
  (host) => `https://favicon.allesedv.com/${host}`,
  (host) => `https://icons.duckduckgo.com/ip3/${host}.ico`,
  (host) => `https://favicon.yandex.net/favicon/${host}`,
];

// jsDelivr-hosted SVG sets. `repo` is the jsDelivr package used for full listings.
const SVG_SETS = {
  hl: {dir: 'dashboard', repo: 'gh/homarr-labs/dashboard-icons@main', base: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/'},
  sh: {dir: 'selfhst', repo: 'gh/selfhst/icons@main', base: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/'},
};

// Iconify packages installed locally, exported with no network access.
const ICONIFY_SETS = {
  mdi: {dir: 'mdi', pkg: '@iconify-json/mdi/icons.json'},
  si: {dir: 'simple', pkg: '@iconify-json/simple-icons/icons.json'},
};

async function listFiles(dir, pattern) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(full, pattern));
    else if (pattern.test(entry.name)) files.push(full);
  }
  return files;
}

async function readJsonRecord(file) {
  try {
    const value = JSON.parse(await readFile(file, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

// Scan docs and components for the URLs and icon names the site actually uses.
async function collectUsage() {
  const pageUrls = new Set();
  const iconUrls = new Set();
  const toolNames = new Set();
  const simpleNames = new Set();

  for (const file of await listFiles(docsDir, /\.mdx?$/i)) {
    const text = await readFile(file, 'utf8');
    for (const [tag] of text.matchAll(/<SourceBadge\b[^>]*>/g)) {
      for (const [url] of tag.matchAll(/https?:\/\/[^"'{}\s<>]+/g)) pageUrls.add(url);
      for (const [, url] of tag.matchAll(/\bicon=["']([^"']+)["']/g)) iconUrls.add(url);
    }
    for (const [, name] of text.matchAll(/<ToolIcon\b[^>]*\bname=["']([^"']+)["']/g)) toolNames.add(name);
  }

  for (const file of await listFiles(componentsDir, /\.tsx?$/i)) {
    const text = await readFile(file, 'utf8');
    for (const [, name] of text.matchAll(/<SimpleIcon\s+name="([^"]+)"/g)) simpleNames.add(name);
    for (const [, name] of text.matchAll(/<ToolIcon\b[^>]*\bname=["']([^"']+)["']/g)) toolNames.add(name);
  }

  return {pageUrls, iconUrls, toolNames, simpleNames};
}

function faviconKeysFor(pageUrl) {
  let host;
  try {
    host = new URL(pageUrl).hostname;
  } catch {
    return [];
  }
  return FAVICON_PROVIDERS.map((build) => build(host));
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {'User-Agent': 'CTT-build-cache/1.0'},
    });
    if (!response.ok) return null;
    const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const extension = EXTENSIONS[type];
    if (!extension) return null; // Rejects HTML from captive portals and error pages.
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length === 0 || body.length > MAX_BYTES) return null;
    return {body, extension};
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, size, worker) {
  let next = 0;
  await Promise.all(Array.from({length: Math.min(size, items.length)}, async () => {
    while (next < items.length) await worker(items[next++]);
  }));
}

function iconToSvg(set, icon) {
  const width = icon.width ?? set.width ?? 24;
  const height = icon.height ?? set.height ?? 24;
  const left = icon.left ?? set.left ?? 0;
  const top = icon.top ?? set.top ?? 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}" width="${width}" height="${height}">${icon.body}</svg>\n`;
}

async function writeTarget(assets) {
  const sorted = Object.fromEntries(Object.entries(assets).sort(([a], [b]) => a.localeCompare(b)));
  await mkdir(path.dirname(target), {recursive: true});
  await writeFile(target,
    '/* Generated by scripts/cache-external-assets.mjs. Do not edit manually. */\n' +
    `export const externalAssets: Readonly<Record<string, string>> = ${JSON.stringify(sorted, null, 2)};\n`);
}

// Full file list of a jsDelivr package, used for CTT_ICONS=all.
async function listJsDelivrSvgs(repo) {
  try {
    const response = await fetch(`https://data.jsdelivr.com/v1/packages/${repo}?structure=flat`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.files ?? [])
      .map((file) => file.name.match(/^\/svg\/([^/]+)\.svg$/)?.[1])
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Find icons referenced by the site, keyed by prefix, e.g. hl -> [proxmox, ...].
function referencedSlugs(toolNames) {
  const byPrefix = {};
  for (const name of toolNames) {
    const match = name.match(/^([a-z]+)-(.+)$/);
    if (!match) continue;
    (byPrefix[match[1]] ??= new Set()).add(match[2]);
  }
  return byPrefix;
}

async function main() {
  const assets = {};
  const counts = {};
  await mkdir(faviconDir, {recursive: true});

  const usage = await collectUsage();
  const used = referencedSlugs(usage.toolNames);

  // 1. Favicons: reuse earlier downloads from the manifest, fetch the rest.
  const previous = await readJsonRecord(faviconManifestPath);
  const failures = await readJsonRecord(faviconFailuresPath);
  const faviconKeys = [...new Set([
    ...[...usage.pageUrls].flatMap(faviconKeysFor),
    ...usage.iconUrls,
  ])];
  const faviconFiles = {};
  for (const key of faviconKeys) {
    const file = previous[key];
    if (file && existsSync(path.join(faviconDir, file))) faviconFiles[key] = file;
  }
  const retryFailures = process.env.CTT_REFRESH_EXTERNAL_ASSETS === '1';
  const retryThreshold = Date.now() - FAILURE_RETRY_MS;
  const pending = faviconKeys.filter((key) =>
    !faviconFiles[key] &&
    (retryFailures || !failures[key] || failures[key] < retryThreshold),
  );
  const deferred = faviconKeys.length - Object.keys(faviconFiles).length - pending.length;
  const failed = [];
  let downloaded = 0;
  await runPool(pending, CONCURRENCY, async (key) => {
    const result = await fetchImage(key);
    if (!result) {
      failed.push(key);
      failures[key] = Date.now();
      return;
    }
    const hash = createHash('sha1').update(key).digest('hex').slice(0, 16);
    const file = `${hash}.${result.extension}`;
    await writeFile(path.join(faviconDir, file), result.body);
    faviconFiles[key] = file;
    delete failures[key];
    downloaded += 1;
  });
  await writeFile(faviconManifestPath, JSON.stringify(faviconFiles, null, 2) + '\n');
  await mkdir(path.dirname(faviconFailuresPath), {recursive: true});
  await writeFile(faviconFailuresPath, JSON.stringify(failures, null, 2) + '\n');
  for (const [key, file] of Object.entries(faviconFiles)) assets[key] = `/img/favicons/${file}`;
  counts.favicons = Object.keys(faviconFiles).length;

  // 2. jsDelivr SVG sets (Dashboard Icons and selfh.st).
  for (const [prefix, set] of Object.entries(SVG_SETS)) {
    const dir = path.join(root, 'static/img/icons', set.dir);
    await mkdir(dir, {recursive: true});
    const slugs = ALL ? await listJsDelivrSvgs(set.repo) : [...(used[prefix] ?? [])];
    if (ALL && slugs.length === 0) console.warn(`[external-assets] Could not list ${set.repo}. Falling back to referenced icons.`);
    const list = slugs.length ? slugs : [...(used[prefix] ?? [])];
    const saved = [];
    const missing = [];
    await runPool(list, CONCURRENCY, async (slug) => {
      const destination = path.join(dir, `${slug}.svg`);
      if (existsSync(destination)) {
        assets[`${set.base}${slug}.svg`] = `/img/icons/${set.dir}/${slug}.svg`;
        saved.push(slug);
        return;
      }
      const result = await fetchImage(`${set.base}${slug}.svg`);
      if (!result) {
        missing.push(slug);
        return;
      }
      await writeFile(destination, result.body);
      assets[`${set.base}${slug}.svg`] = `/img/icons/${set.dir}/${slug}.svg`;
      saved.push(slug);
    });
    counts[prefix] = saved.length;
    if (missing.length) console.warn(`[external-assets] ${prefix}: ${missing.length} icon(s) not downloaded (check the name or reconnect): ${missing.slice(0, 8).join(', ')}`);
  }

  // 3. Iconify packages (installed locally, no network needed).
  for (const [prefix, set] of Object.entries(ICONIFY_SETS)) {
    const dir = path.join(root, 'static/img/icons', set.dir);
    await mkdir(dir, {recursive: true});
    let iconSet;
    try {
      iconSet = JSON.parse(await readFile(path.join(root, 'node_modules', set.pkg), 'utf8'));
    } catch {
      console.warn(`[external-assets] node_modules/${set.pkg} not found. Run npm install. ${prefix} icons were skipped.`);
      continue;
    }
    const names = ALL
      ? Object.keys(iconSet.icons ?? {})
      : [...(used[prefix] ?? [])];
    if (prefix === 'si') for (const name of usage.simpleNames) names.push(name);
    let saved = 0;
    for (const name of new Set(names)) {
      const icon = iconSet.icons?.[name];
      if (!icon) {
        if (used[prefix]?.has(name)) console.warn(`[external-assets] ${prefix}-${name} is not in ${set.pkg}.`);
        continue;
      }
      await writeFile(path.join(dir, `${name}.svg`), iconToSvg(iconSet, icon));
      assets[`iconify:${prefix}-${name}`] = `/img/icons/${set.dir}/${name}.svg`;
      if (prefix === 'si') assets[`https://cdn.simpleicons.org/${name}`] = `/img/icons/${set.dir}/${name}.svg`;
      saved += 1;
    }
    counts[prefix] = saved;
  }

  await writeTarget(assets);
  console.log(`[external-assets] mode=${ALL ? 'all' : 'referenced'} favicons=${counts.favicons} (${downloaded} new) ` +
    `hl=${counts.hl ?? 0} sh=${counts.sh ?? 0} mdi=${counts.mdi ?? 0} si=${counts.si ?? 0}`);
  if (failed.length) {
    console.warn(`[external-assets] ${failed.length} favicon URL(s) could not be downloaded. Connect to the internet and rebuild to save them:`);
    for (const key of failed.slice(0, 10)) console.warn(`  - ${key}`);
    if (failed.length > 10) console.warn(`  ...and ${failed.length - 10} more.`);
  }
  if (deferred) {
    console.log(`[external-assets] deferred ${deferred} recently unavailable favicon URL(s); set CTT_REFRESH_EXTERNAL_ASSETS=1 to retry now.`);
  }
}

try {
  await main();
} catch (error) {
  // Never fail the build over optional icons. Write an empty map so imports still resolve.
  console.warn('[external-assets] Skipped external icon caching:', error?.message ?? error);
  await writeTarget({});
}
