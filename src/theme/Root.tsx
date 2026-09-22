import {useEffect} from 'react';
import type {ReactNode} from 'react';

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
      {children}
    </>
  );
}
