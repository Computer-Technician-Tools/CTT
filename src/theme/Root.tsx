import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import mediaStyles from '@site/src/components/MediaPreview/styles.module.css';

import ThemeEffects from '@site/src/components/ThemeEffects';
import ThemePicker from '@site/src/components/ThemePicker';

const darkOnlyThemes = new Set<string>([
  'custom',
  'galaxy',
  'christmas',
  'halloween',
  'amoled',
  'TKOD',
]);

function isMobileTocExpanded(): boolean {
  const toc = document.querySelector('.theme-doc-toc-mobile');
  if (!toc) return false;

  const button = toc.querySelector<HTMLButtonElement>('button');
  if (button?.getAttribute('aria-expanded') === 'true') return true;

  return Boolean(toc.querySelector('[class*="tocCollapsibleExpanded"]'));
}

function collapseMobileToc(): boolean {
  const toc = document.querySelector('.theme-doc-toc-mobile');
  if (!toc || !isMobileTocExpanded()) return false;

  const button = toc.querySelector<HTMLButtonElement>('button');
  if (!button) return false;

  button.click();
  return true;
}

function getTocEntries(): Array<{link: HTMLAnchorElement; heading: HTMLElement}> {
  const toc = document.querySelector('.theme-doc-toc-mobile');
  if (!toc) return [];

  const links = Array.from(
    toc.querySelectorAll<HTMLAnchorElement>('.table-of-contents a[href^="#"]'),
  );
  const entries: Array<{link: HTMLAnchorElement; heading: HTMLElement}> = [];
  const seen = new Set<string>();

  for (const link of links) {
    const rawHash = link.getAttribute('href');
    if (!rawHash || rawHash === '#') continue;

    let id: string;
    try {
      id = decodeURIComponent(rawHash.slice(1));
    } catch {
      continue;
    }

    // Docusaurus can briefly render the same anchor more than once while the
    // mobile TOC is being rebuilt. Only one entry should ever be active.
    if (seen.has(id)) continue;

    const heading = document.getElementById(id);
    if (!heading) continue;

    seen.add(id);
    entries.push({link, heading});
  }

  return entries;
}

function getDocumentScrollTop(): number {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function setMobileTocActiveLink(activeLink: HTMLAnchorElement | null): void {
  const toc = document.querySelector('.theme-doc-toc-mobile');
  if (!toc) return;

  toc
    .querySelectorAll<HTMLAnchorElement>('.table-of-contents a[href^="#"]')
    .forEach((link) => {
      const active = link === activeLink;
      link.toggleAttribute('data-ctt-toc-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
}

function syncMobileTocActiveHeading(forcedActiveId: string | null = null): void {
  const entries = getTocEntries();
  if (!entries.length) return;

  // Keep the item the user just clicked active while the smooth scroll is
  // settling. Docusaurus can otherwise recalculate the active heading from
  // intermediate scroll positions and remove the clicked highlight.
  if (forcedActiveId) {
    const forcedEntry = entries.find(({heading}) => heading.id === forcedActiveId);
    if (forcedEntry) {
      setMobileTocActiveLink(forcedEntry.link);
      return;
    }
  }

  const navbar = document.querySelector<HTMLElement>('.navbar');
  const toc = document.querySelector<HTMLElement>('.theme-doc-toc-mobile');
  const button = toc?.querySelector<HTMLElement>('button');

  const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
  const tocHeight = button?.getBoundingClientRect().height ?? 0;
  const activationLine = navbarHeight + tocHeight + 24;

  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  const scrollTop = getDocumentScrollTop();
  const activationDocumentY = scrollTop + activationLine;

  for (let index = 0; index < entries.length; index += 1) {
    const headingDocumentY = entries[index].heading.getBoundingClientRect().top + scrollTop;
    const distance = activationDocumentY - headingDocumentY;

    if (distance >= 0) {
      // The last heading above the activation line wins.
      activeIndex = index;
      closestDistance = distance;
    } else if (closestDistance !== Number.POSITIVE_INFINITY) {
      break;
    } else {
      // At the very top of a page, the first heading is the current section.
      activeIndex = 0;
    }
  }

  setMobileTocActiveLink(entries[activeIndex]?.link ?? null);
}

function scrollToHashTarget(rawHash: string): boolean {
  if (!rawHash || rawHash === '#') return false;

  let id: string;
  try {
    id = decodeURIComponent(rawHash.slice(1));
  } catch {
    return false;
  }

  const heading = document.getElementById(id);
  if (!heading) return false;

  const navbar = document.querySelector<HTMLElement>('.navbar');
  const toc = document.querySelector<HTMLElement>('.theme-doc-toc-mobile');
  const button = toc?.querySelector<HTMLElement>('button');
  const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
  const tocHeight = window.matchMedia('(max-width: 996px)').matches
    ? (button?.getBoundingClientRect().height ?? 0)
    : 0;

  // Use document coordinates instead of relying solely on window.scrollY.
  // This is more reliable across Firefox's root scrolling implementation.
  const currentScrollTop = getDocumentScrollTop();
  const targetTop =
    currentScrollTop +
    heading.getBoundingClientRect().top -
    navbarHeight -
    tocHeight -
    16;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });

  return true;
}

function installMobileTocInteractions(): () => void {
  let scrollFrame = 0;
  let refreshTimer = 0;
  let collapseTimer = 0;
  let forcedActiveId: string | null = null;
  let forcedActiveTimer = 0;
  let scrollIntentTimer = 0;

  const sync = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      syncMobileTocActiveHeading(forcedActiveId);
    });
  };

  const releaseForcedActive = () => {
    forcedActiveId = null;
    window.clearTimeout(forcedActiveTimer);
    forcedActiveTimer = 0;
    sync();
  };

  const refresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      sync();
      // Docusaurus can finish rebuilding the mobile TOC a frame or two after
      // the drawer/TOC changes state. Re-sync after layout has settled so the
      // heading under the current scroll position is always highlighted.
      window.setTimeout(sync, 100);
      window.setTimeout(sync, 300);
    }, 50);
  };

  const handlePointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const toc = target.closest('.theme-doc-toc-mobile');
    if (!toc) {
      collapseMobileToc();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      collapseMobileToc();
    }
  };

  const handleSmoothAnchorClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || (link.target && link.target !== '_self')) return;

    const rawHash = link.getAttribute('href');
    if (!rawHash || rawHash === '#') return;

    let targetId: string;
    try {
      targetId = decodeURIComponent(rawHash.slice(1));
    } catch {
      return;
    }

    if (!document.getElementById(targetId)) return;

    event.preventDefault();

    const isMobileTocLink = Boolean(link.closest('.theme-doc-toc-mobile'));

    if (window.location.hash !== rawHash) {
      window.history.pushState(null, '', rawHash);
    }

    if (isMobileTocLink) {
      // Close the TOC before calculating the final destination. If we start
      // the smooth scroll while the expanded TOC is still changing height,
      // the layout shift can interrupt the scroll and leave the target partly
      // hidden underneath the fixed TOC.
      forcedActiveId = targetId;
      window.clearTimeout(forcedActiveTimer);
      window.clearTimeout(collapseTimer);
      window.clearTimeout(scrollIntentTimer);
      setMobileTocActiveLink(link);

      // Collapse first. The native Docusaurus TOC animates its expanded panel,
      // so calculating the destination while it is open produces a target that
      // can end up underneath the fixed TOC. Wait until the collapse has settled.
      const wasExpanded = collapseMobileToc();
      const wait = wasExpanded ? 360 : 0;

      collapseTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!scrollToHashTarget(rawHash)) {
              forcedActiveId = null;
              return;
            }

            setMobileTocActiveLink(link);

            // Keep the clicked item active through the browser's smooth-scroll
            // animation. Release control afterward so normal scroll tracking
            // can resume.
            forcedActiveTimer = window.setTimeout(() => {
              forcedActiveId = null;
              forcedActiveTimer = 0;
              sync();
            }, 900);

            window.setTimeout(sync, 120);
            window.setTimeout(sync, 400);
          });
        });
      }, wait);
      return;
    }

    if (!scrollToHashTarget(rawHash)) return;

    forcedActiveId = null;
    window.clearTimeout(forcedActiveTimer);
    forcedActiveTimer = 0;

    window.setTimeout(sync, 120);
    window.setTimeout(sync, 350);
  };

  const handleUserScrollIntent = () => {
    if (!forcedActiveId) return;

    window.clearTimeout(scrollIntentTimer);
    scrollIntentTimer = window.setTimeout(() => {
      releaseForcedActive();
    }, 80);
  };

  const handleHashChange = () => {
    if (window.location.hash) {
      scrollToHashTarget(window.location.hash);
    }
    refresh();
  };

  // Docusaurus changes the mobile TOC between collapsed/expanded states
  // without necessarily replacing the TOC DOM. Recalculate the active
  // heading after the toggle so the visible section is highlighted
  // immediately when the menu opens.
  const handleTocToggle = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>('.theme-doc-toc-mobile button');
    if (!button) return;

    window.setTimeout(sync, 0);
    window.setTimeout(sync, 50);
    window.setTimeout(sync, 150);
    window.setTimeout(sync, 300);
  };

  // Observe DOM replacement, but not class attributes: Docusaurus itself
  // changes the native active class and observing that would create a loop.
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {childList: true, subtree: true});

  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('click', handleSmoothAnchorClick, true);
  document.addEventListener('click', handleTocToggle, true);
  window.addEventListener('scroll', sync, {passive: true});
  window.addEventListener('wheel', handleUserScrollIntent, {passive: true});
  window.addEventListener('touchstart', handleUserScrollIntent, {passive: true});
  window.addEventListener('resize', sync, {passive: true});
  window.addEventListener('hashchange', handleHashChange);

  sync();
  window.setTimeout(sync, 100);
  window.setTimeout(sync, 300);

  return () => {
    document.removeEventListener('pointerdown', handlePointerDown, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('click', handleSmoothAnchorClick, true);
    document.removeEventListener('click', handleTocToggle, true);
    window.removeEventListener('scroll', sync);
    window.removeEventListener('wheel', handleUserScrollIntent);
    window.removeEventListener('touchstart', handleUserScrollIntent);
    window.removeEventListener('resize', sync);
    window.removeEventListener('hashchange', handleHashChange);
    observer.disconnect();
    window.cancelAnimationFrame(scrollFrame);
    window.clearTimeout(refreshTimer);
    window.clearTimeout(collapseTimer);
    window.clearTimeout(forcedActiveTimer);
    window.clearTimeout(scrollIntentTimer);
    forcedActiveId = null;
  };
}


function prepareMobileTableCards(): void {
  const tables = document.querySelectorAll<HTMLTableElement>(
    '.theme-doc-markdown table, .markdown table',
  );

  tables.forEach((table) => {
    if (table.dataset.cttMobileCardsReady === 'true') return;

    const headerRow = table.querySelector<HTMLTableRowElement>('thead > tr');
    if (!headerRow) return;

    const headers = Array.from(headerRow.children).map((cell) =>
      (cell.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );

    if (!headers.length || headers.some((label) => !label)) return;

    const bodyRows = Array.from(table.tBodies).flatMap((tbody) =>
      Array.from(tbody.rows),
    );

    // Preserve complex tables that rely on spanning cells.
    const isRectangular = bodyRows.every((row) => {
      if (row.cells.length !== headers.length) return false;
      return Array.from(row.cells).every(
        (cell) => cell.rowSpan === 1 && cell.colSpan === 1,
      );
    });

    if (!isRectangular || !bodyRows.length) return;

    bodyRows.forEach((row) => {
      Array.from(row.cells).forEach((cell, index) => {
        cell.setAttribute('data-ctt-mobile-label', headers[index]);
        cell.toggleAttribute('data-ctt-mobile-title', index === 0);
      });
    });

    table.dataset.cttMobileCardsReady = 'true';
  });
}

function installMobileTableCards(): () => void {
  let timer = 0;

  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(prepareMobileTableCards, 50);
  };

  prepareMobileTableCards();

  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {childList: true, subtree: true});

  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
  };
}


type CTTPreviewKind = 'image' | 'video';
type CTTPreviewState = {src: string; kind: CTTPreviewKind; alt: string; title: string};

const CTT_MEDIA_EXTENSION = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp|mp4|webm|ogv|ogg|mov|m4v|m3u8|mpd)(?:$|[?#])/i;
const CTT_VIDEO_EXTENSION = /\.(?:mp4|webm|ogv|ogg|mov|m4v|m3u8|mpd)(?:$|[?#])/i;

function getSafeCTTMediaSource(value: string | null | undefined): string | null {
  if (!value) return null;
  const source = value.trim();
  if (!source || source.startsWith('//')) return null;
  if (source.startsWith('/') || source.startsWith('./') || source.startsWith('../')) return source;
  try {
    const parsed = new URL(source);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? source : null;
  } catch {
    return null;
  }
}

function isCTTMediaHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.href);
    return CTT_MEDIA_EXTENSION.test(url.pathname + url.search + url.hash);
  } catch {
    return CTT_MEDIA_EXTENSION.test(href);
  }
}

function getCTTMediaTitle(element: Element | null, fallback: string): string {
  return element?.getAttribute('title')?.trim() || element?.getAttribute('alt')?.trim() || fallback;
}

function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

type CTTChapter = {time: number; title: string};

function CTTIcon({name}: {name: 'play' | 'pause' | 'back' | 'forward' | 'volume' | 'mute' | 'settings' | 'fullscreen' | 'download' | 'chapter' | 'pip'}) {
  const paths: Record<typeof name, ReactNode> = {
    play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
    pause: <path d="M7 5h4v14H7zM15 5h4v14h-4z" fill="currentColor" stroke="none" />,
    back: <><path d="M11 5 4 12l7 7"/><path d="M4 12h10a6 6 0 0 1 6 6"/></>,
    forward: <><path d="m13 5 7 7-7 7"/><path d="M20 12H10a6 6 0 0 0-6 6"/></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a5 5 0 0 1 0 6M18 5a10 10 0 0 1 0 14"/></>,
    mute: <><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="m17 9 5 6m0-6-5 6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1L11 7.4h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2z" transform="translate(-1 -1)"/></>,
    fullscreen: <><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v4h16v-4"/></>,
    chapter: <><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></>,
    pip: <><rect x="3" y="4" width="18" height="16" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor" stroke="none"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function parseVttTime(value: string): number {
  const parts = value.trim().replace(',', '.').split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function CTTVideoPlayer({src, title}: {src: string; title: string}) {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [customSpeed, setCustomSpeed] = useState('1.25');
  const [speedError, setSpeedError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [chapters, setChapters] = useState<CTTChapter[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Focus the player container on open so keyboard shortcuts work immediately.
    // Buttons and form fields retain normal keyboard behavior when focused.
    playerRef.current?.focus({preventScroll: true});
  }, []);

  useEffect(() => {
    // Optional convention: place `video-name.chapters.vtt` beside the video.
    // Only same-origin files are fetched; missing chapter files are harmless.
    let cancelled = false;
    try {
      const url = new URL(src, window.location.href);
      if (url.origin !== window.location.origin) return undefined;
      url.pathname = url.pathname.replace(/\.[^/.]+$/, '.chapters.vtt');
      fetch(url.toString(), {credentials: 'same-origin'}).then((response) => {
        if (!response.ok) return '';
        return response.text();
      }).then((text) => {
        if (cancelled || !text) return;
        const parsed: CTTChapter[] = [];
        const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
        for (const block of blocks) {
          const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
          const timing = lines.findIndex((line) => line.includes('-->'));
          if (timing < 0) continue;
          const match = lines[timing].match(/^([\d:.]+)\s+-->\s+([\d:.]+)/);
          const chapterTitle = lines[timing + 1];
          if (match && chapterTitle) parsed.push({time: parseVttTime(match[1]), title: chapterTitle.slice(0, 160)});
        }
        setChapters(parsed.sort((a, b) => a.time - b.time));
      }).catch(() => undefined);
    } catch { /* Invalid URLs simply have no optional chapters. */ }
    return () => { cancelled = true; };
  }, [src]);

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = Math.max(0, Math.min(Number.isFinite(video.duration) ? video.duration : 0, value));
    setCurrentTime(video.currentTime);
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setError('Playback could not start. Check the file format and browser support.'));
    else video.pause();
  };
  const setPlaybackSpeed = (value: number): boolean => {
    // HTMLMediaElement.playbackRate accepts positive rates. Keep a broad,
    // explicit safety range while allowing fine-grained slow/fast playback.
    if (!Number.isFinite(value) || value < 0.05 || value > 16) {
      setSpeedError('Enter a speed between 0.05× and 16×.');
      return false;
    }
    setSpeedError('');
    setSpeed(value);
    setCustomSpeed(String(value));
    if (videoRef.current) videoRef.current.playbackRate = value;
    return true;
  };
  const applyCustomSpeed = () => {
    const value = customSpeed.trim() === '' ? NaN : Number(customSpeed);
    if (setPlaybackSpeed(value)) {
      // Keep keyboard focus on Apply so repeated adjustments don't require
      // clicking the video surface to reactivate the player.
      setSettingsOpen(true);
    }
  };
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else if (player.requestFullscreen) void player.requestFullscreen().catch(() => undefined);
  };
  const onPlayerKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.matches('input, select, textarea, [contenteditable="true"]') || target?.isContentEditable) return;
    const video = videoRef.current;
    if (!video) return;
    switch (event.key.toLowerCase()) {
      case ' ': case 'k': event.preventDefault(); togglePlayback(); break;
      case 'arrowleft': event.preventDefault(); seek(video.currentTime - 5); break;
      case 'arrowright': event.preventDefault(); seek(video.currentTime + 5); break;
      case 'j': event.preventDefault(); seek(video.currentTime - 10); break;
      case 'l': event.preventDefault(); seek(video.currentTime + 10); break;
      case 'm': event.preventDefault(); video.muted = !video.muted; setMuted(video.muted); break;
      case 'f': event.preventDefault(); toggleFullscreen(); break;
      case ',': event.preventDefault(); setPlaybackSpeed(Math.max(0.05, Math.round((speed - 0.25) * 100) / 100)); break;
      case '.': event.preventDefault(); setPlaybackSpeed(Math.min(16, Math.round((speed + 0.25) * 100) / 100)); break;
      case '0': event.preventDefault(); seek(0); break;
      default:
        if (/^[1-9]$/.test(event.key) && duration > 0) { event.preventDefault(); seek(duration * (Number(event.key) / 10)); }
    }
  }, [duration, speed]);

  useEffect(() => {
    // Keep the handler current without re-registering it after every render.
    const handleDocumentKeyDown = (event: KeyboardEvent) => onPlayerKeyDown(event);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => document.removeEventListener('keydown', handleDocumentKeyDown);
  }, [onPlayerKeyDown]);

  return (
    <div ref={playerRef} className={mediaStyles.videoPlayer} tabIndex={0} aria-label={`${title} player`}>
      <video
        ref={videoRef}
        className={mediaStyles.fullMedia}
        src={src}
        autoPlay
        playsInline
        preload="metadata"
        aria-label={title}
        onClick={togglePlayback}
        onPlay={() => { setPlaying(true); setError(''); }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onVolumeChange={(event) => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted); }}
        onError={() => setError('This video could not be loaded or its format is unsupported.')}
        onEnded={() => setPlaying(false)}
      />
      {error && <div className={mediaStyles.playerError} role="status">{error}</div>}
      <div className={mediaStyles.playerControls} aria-label="Video controls" onClick={(event) => event.stopPropagation()}>
        <button className={mediaStyles.playerButton} type="button" onClick={togglePlayback} aria-label={playing ? 'Pause video (K)' : 'Play video (K)'} title={playing ? 'Pause (K or Space)' : 'Play (K or Space)'}><CTTIcon name={playing ? 'pause' : 'play'} /></button>
        <button className={mediaStyles.playerButton} type="button" onClick={() => seek(currentTime - 10)} aria-label="Back 10 seconds" title="Back 10 seconds (J)"><CTTIcon name="back" /><small>10</small></button>
        <button className={mediaStyles.playerButton} type="button" onClick={() => seek(currentTime + 10)} aria-label="Forward 10 seconds" title="Forward 10 seconds (L)"><CTTIcon name="forward" /><small>10</small></button>
        <span className={mediaStyles.timeLabel}>{formatMediaTime(currentTime)}</span>
        <input className={mediaStyles.timeline} type="range" min={0} max={Math.max(duration, 0.1)} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.currentTarget.value))} aria-label="Seek video" style={{'--ctt-progress': `${duration ? (currentTime / duration) * 100 : 0}%`} as CSSProperties} />
        <span className={mediaStyles.timeLabel}>{formatMediaTime(duration)}</span>
        <button className={mediaStyles.playerButton} type="button" onClick={() => { const nextMuted = !muted; setMuted(nextMuted); if (videoRef.current) videoRef.current.muted = nextMuted; }} aria-label={muted ? 'Unmute video' : 'Mute video'} title="Mute (M)"><CTTIcon name={muted || volume === 0 ? 'mute' : 'volume'} /></button>
        <input className={mediaStyles.volumeSlider} type="range" min={0} max={1} step="0.05" value={muted ? 0 : volume} onChange={(event) => { const nextVolume = Number(event.currentTarget.value); setVolume(nextVolume); setMuted(nextVolume === 0); if (videoRef.current) { videoRef.current.volume = nextVolume; videoRef.current.muted = nextVolume === 0; } }} aria-label="Volume" />
        <button className={`${mediaStyles.playerButton} ${settingsOpen ? mediaStyles.activePlayerButton : ''}`} type="button" onClick={() => { setSettingsOpen((value) => !value); setChaptersOpen(false); }} aria-label="Video settings" aria-expanded={settingsOpen} title="Settings"><CTTIcon name="settings" /></button>
        {chapters.length > 0 && <button className={`${mediaStyles.playerButton} ${chaptersOpen ? mediaStyles.activePlayerButton : ''}`} type="button" onClick={() => { setChaptersOpen((value) => !value); setSettingsOpen(false); }} aria-label="Chapters" aria-expanded={chaptersOpen} title="Chapters"><CTTIcon name="chapter" /></button>}
        <button className={mediaStyles.playerButton} type="button" onClick={toggleFullscreen} aria-label="Fullscreen video" title="Fullscreen (F)"><CTTIcon name="fullscreen" /></button>
        <a className={mediaStyles.downloadButton} href={src} download aria-label={`Download ${title}`} title="Download video"><CTTIcon name="download" /><span>Download</span></a>
      </div>
      {settingsOpen && <div className={mediaStyles.playerPanel} role="group" aria-label="Playback settings">
        <label>Speed <select className={mediaStyles.speedSelect} value={speed} onChange={(event) => setPlaybackSpeed(Number(event.currentTarget.value))}>{[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4].map((rate) => <option key={rate} value={rate}>{rate}×{rate === 1 ? ' (Normal)' : ''}</option>)}</select></label>
        <label className={mediaStyles.customSpeed}>Custom speed <input type="number" min="0.05" max="16" step="any" inputMode="decimal" value={customSpeed} aria-describedby="ctt-speed-help" onChange={(event) => { setCustomSpeed(event.target.value); setSpeedError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') applyCustomSpeed(); }} /><button className={mediaStyles.panelAction} type="button" onClick={applyCustomSpeed}>Apply</button></label>
        <span id="ctt-speed-help" className={speedError ? mediaStyles.playerError : mediaStyles.shortcutHint} role={speedError ? 'alert' : undefined}>{speedError || 'Custom speed: 0.05×–16×. Examples: 0.1, 0.33, 1.8, 6.25.'}</span>
        <span className={mediaStyles.shortcutHint}>Shortcuts: Space/K play · ←/→ 5s · J/L 10s · M mute · F fullscreen · ,/. speed</span>
      </div>}
      {chaptersOpen && chapters.length > 0 && <div className={mediaStyles.chapterList} role="group" aria-label="Video chapters">{chapters.map((chapter) => <button key={`${chapter.time}-${chapter.title}`} type="button" onClick={() => { seek(chapter.time); setChaptersOpen(false); }}><span>{chapter.title}</span><time>{formatMediaTime(chapter.time)}</time></button>)}</div>}
    </div>
  );
}

/**
 * Capture media clicks globally. This is deliberately handled at the document
 * capture phase so normal Markdown links and linked media are intercepted
 * before an anchor can navigate away from the current page.
 */
function CTTMediaViewer() {
  const [activeMedia, setActiveMedia] = useState<CTTPreviewState | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setActiveMedia(null), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-ctt-media-viewer="true"]')) return;

      const image = target.closest('img');
      const video = target.closest('video');
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      let source: string | null = null;
      let kind: CTTPreviewKind = 'image';
      let title = 'Image preview';
      let alt = '';

      if (image) {
        source = image.currentSrc || image.getAttribute('src');
        alt = image.getAttribute('alt') || '';
        title = getCTTMediaTitle(image, 'Image preview');
        kind = CTT_VIDEO_EXTENSION.test(source || '') ? 'video' : 'image';
      } else if (video) {
        // Native controls should remain interactive; only intercept the video surface.
        if (target.closest('button, input, select, textarea')) return;
        source = video.currentSrc || video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || null;
        title = getCTTMediaTitle(video, 'Video preview');
        kind = 'video';
      } else if (anchor && isCTTMediaHref(anchor.href)) {
        source = anchor.href;
        kind = CTT_VIDEO_EXTENSION.test(anchor.href) ? 'video' : 'image';
        title = getCTTMediaTitle(anchor, kind === 'video' ? 'Video preview' : 'Image preview');
      }

      const safeSource = getSafeCTTMediaSource(source);
      if (!safeSource) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setActiveMedia({src: safeSource, kind, alt, title});
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (!activeMedia) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [activeMedia, close]);

  if (!activeMedia) return null;
  return (
    <div
      className={mediaStyles.backdrop}
      data-ctt-media-viewer="true"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <section className={mediaStyles.dialog} role="dialog" aria-modal="true" aria-label={activeMedia.title} tabIndex={-1}>
        <header className={mediaStyles.toolbar}>
          <span className={mediaStyles.dialogTitle}>{activeMedia.title}</span>
          {activeMedia.kind === 'image' && (
            <a
              className={mediaStyles.downloadButton}
              href={activeMedia.src}
              download
              rel="noreferrer"
              aria-label={`Download ${activeMedia.title}`}
              title="Download image or GIF"
            >
              <CTTIcon name="download" />
              <span>Download</span>
            </a>
          )}
          <button ref={closeButtonRef} className={mediaStyles.control} type="button" onClick={close} aria-label="Close media preview">×</button>
        </header>
        <div className={mediaStyles.stage}>
          {activeMedia.kind === 'video' ? (
            <CTTVideoPlayer src={activeMedia.src} title={activeMedia.title} />
          ) : (
            <img className={mediaStyles.fullMedia} src={activeMedia.src} alt={activeMedia.alt || activeMedia.title} decoding="async" />
          )}
        </div>
      </section>
    </div>
  );
}

function ThemeModeEnforcer(): null {
  useEffect(() => {
    const root = document.documentElement;

    const stabilizeNavbarLogo = () => {
      const logos = document.querySelectorAll<HTMLImageElement>(
        '.navbar__logo, .navbar-sidebar__brand .navbar__logo',
      );

      logos.forEach((logo) => {
        // Keep one stable asset in every CTT color mode. Docusaurus/the theme
        // CSS must not make the logo disappear or swap it when data-theme changes.
        if (logo.getAttribute('src') !== '/img/logo.png') {
          logo.setAttribute('src', '/img/logo.png');
        }
        logo.removeAttribute('srcset');
        logo.style.setProperty('display', 'block', 'important');
        logo.style.setProperty('visibility', 'visible', 'important');
        logo.style.setProperty('opacity', '1', 'important');
        logo.style.setProperty('filter', 'none', 'important');
        logo.style.setProperty('mix-blend-mode', 'normal', 'important');
      });
    };

    const enforceThemeMode = () => {
      stabilizeNavbarLogo();

      const theme = root.getAttribute('data-tech-theme');

      if (!theme || !darkOnlyThemes.has(theme)) return;

      if (root.getAttribute('data-theme') !== 'dark') {
        root.setAttribute('data-theme', 'dark');
      }

      root.style.colorScheme = 'dark';
    };

    const updatePageScrollState = () => {
      const isScrolled = getDocumentScrollTop() > 24;
      root.toggleAttribute('data-ctt-page-scrolled', isScrolled);
    };

    enforceThemeMode();
    stabilizeNavbarLogo();
    updatePageScrollState();

    window.addEventListener('scroll', updatePageScrollState, {passive: true});

    const observer = new MutationObserver(enforceThemeMode);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-tech-theme', 'data-theme'],
    });

    const logoObserver = new MutationObserver(stabilizeNavbarLogo);
    logoObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const tocCleanup = installMobileTocInteractions();
    const mobileTableCleanup = installMobileTableCards();

    return () => {
      observer.disconnect();
      logoObserver.disconnect();
      tocCleanup();
      window.removeEventListener('scroll', updatePageScrollState);
      root.removeAttribute('data-ctt-page-scrolled');
    };
  }, []);

  return null;
}

export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      <ThemeModeEnforcer />
      <ThemeEffects />
      <ThemePicker />
      <CTTMediaViewer />
      {children}
    </>
  );
}
