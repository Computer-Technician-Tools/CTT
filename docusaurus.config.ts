import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...).

const config: Config = {
  // ============================================================
  // SITE INFORMATION
  // ============================================================

  title: 'Computer Technician Tools',

  tagline:
    'The Open Source Knowledge base for fixing, configuring, securing, understanding technology and much more...',

  favicon: 'img/favicon.ico',

  // ============================================================
  // FUTURE FLAGS
  // ============================================================

  future: {
    v4: true,
    // Rspack's development module graph currently panics on Windows for this
    // project. Keep the stable Webpack compiler enabled so `npm run start`
    // consistently starts and hot-reloads instead of crashing mid-compile.
    faster: false,
  },

  // ============================================================
  // URL / DEPLOYMENT
  // ============================================================

  url: 'https://ctt.mrcyo.com',

  baseUrl: '/',

  organizationName: 'MRCYODev',
  projectName: 'CTT',

  // ============================================================
  // BUILD VALIDATION
  // ============================================================

  onBrokenLinks: 'throw',
  onDuplicateRoutes: 'throw',

  // ============================================================
  // INTERNATIONALIZATION
  // ============================================================

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Apply the saved CTT theme before React mounts to prevent a light/default flash.
  scripts: [
    {
      src: '/js/theme-init.js',
    },
    ...(process.env.NODE_ENV !== 'production'
      ? [{ src: '/js/development-reset.js', defer: true }]
      : []),
  ],

  // Installable PWA metadata. The SVG logo is the app icon source.
  headTags: [
    { tagName: 'link', attributes: { rel: 'manifest', href: '/manifest.webmanifest' } },
    { tagName: 'link', attributes: { rel: 'apple-touch-icon', href: '/img/pwa-192.png' } },
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#7c3aed' } },
  ],

  // ============================================================
  // IDEAL IMAGE PLUGIN
  // ============================================================

  // Responsive, lazy-loaded documentation images with generated
  // resized variants and a low-quality placeholder.
  // PNG and JPG image imports are supported by the plugin.
  plugins: [
    // Use full-page refreshes in development. This avoids a Windows Webpack
    // CSS-HMR runtime crash while keeping automatic refresh on file changes.
    './plugins/stable-dev-server.cjs',
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 85,
        min: 480,
        max: 1920,
        steps: 4,

        // Keep optimized image behavior testable with `npm start`.
        disableInDev: false,
      },
    ],
  ],

  // ============================================================
  // PRESETS
  // ============================================================

  presets: [
    [
      'classic',
      {
        // --------------------------------------------------------
        // DOCUMENTATION
        // --------------------------------------------------------

        docs: {
          sidebarPath: './sidebars.ts',

          // The source archive may be built outside Git; avoid failing builds
          // while trying to read per-file history metadata.
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,

          breadcrumbs: true,
        },

        // --------------------------------------------------------
        // BLOG
        // --------------------------------------------------------

        blog: false,

        // --------------------------------------------------------
        // THEME
        // --------------------------------------------------------

        theme: {
          // Load order matters: theme palettes first, then base styles, then
          // themes and effects, and responsive rules last.
          customCss: [
            './src/css/theme-palettes.css',
            './src/css/base.css',
            './src/css/themes-effects.css',
            './src/css/responsive.css',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  // ============================================================
  // LOCAL SEARCH
  // ============================================================

  // @easyops-cn/docusaurus-search-local is a theme (not a plugin).
  // Keeping it in `themes` ensures the SearchBar and SearchPage are
  // registered correctly with Docusaurus 3.x.
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // Generate a hashed search index so browsers can cache it
        // safely while still receiving a new index after docs change.
        // Put the content hash in the filename so CDNs can cache the index
        // immutably and a documentation update naturally gets a new URL.
        hashed: 'filename',

        // Search documentation written in English.
        language: ['en'],

        // Index docs and normal Docusaurus pages.
        indexDocs: true,
        indexBlog: false,
        indexPages: true,

        // Highlight matching terms after opening a result.
        // Highlighting pulls mark.js into the site-wide main bundle. Search
        // results already show useful context, so keep this optional code out
        // of every route's initial JavaScript.
        highlightSearchTermsOnTargetPage: false,

        // Show the heading/path in search suggestions.
        explicitSearchResultPath: true,

        // More useful results for a larger CTT knowledge base.
        searchResultLimits: 12,
        searchResultContextMaxLength: 100,

        // Keep useful technical words such as "the", "for", etc.
        // in the index where they can be relevant to troubleshooting
        // and command/reference searches.
        removeDefaultStopWordFilter: ['en'],

        // Enable partial-word matching.
        removeDefaultStemmer: true,

        // Keyboard shortcut: Ctrl+K on Windows/Linux, Cmd+K on macOS.
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchBarShortcutKeymap: 'mod+k',

        // Let the plugin place the search bar based on the navbar.
        searchBarPosition: 'right',

        // The docs use the normal /docs route.
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  // ============================================================
  // THEME CONFIGURATION
  // ============================================================

  themeConfig: {
    // Show the page index down to h4 for faster navigation on mobile and desktop.
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },

    // ----------------------------------------------------------
    // COLOR MODE
    // ----------------------------------------------------------

    colorMode: {
      respectPrefersColorScheme: false,
      disableSwitch: false,
    },

    // ----------------------------------------------------------
    // NAVBAR
    // ----------------------------------------------------------

    navbar: {
      logo: {
        alt: 'CTT Logo',
        src: '/img/logo.svg',
        target: '_self',
        href: 'https://ctt.mrcyo.com',
        width: 48,
        height: 48,
      },

      items: [
        {
          type: 'docSidebar',
          sidebarId: 'technicianSidebar',
          position: 'left',
          label: 'Get Started',
        },

        // Local search
        {
          type: 'search',
          position: 'right',
        },

      ],
    },

    // ----------------------------------------------------------
    // FOOTER
    // ----------------------------------------------------------

    footer: {
      style: 'dark',

      links: [
        {
          title: 'Docs',

          items: [
            {
              label: 'Start here',
              to: '/docs/getting-started',
            },
          ],
        },

        {
          title: 'Reference',

          items: [
            {
              label: 'Hardware & Software Diagnostics',
              to: '/docs/tools/diagnostics/',
            },

            {
              label: 'Utilities',
              to: '/docs/tools/utilities/',
            },
            {
              label: 'Guides',
              to: '/docs/tools/guides/',
            },
            {
              label: 'Networking',
              to: '/docs/tools/network/',
            },
          ],
        },

        {
          title: 'Platforms',

          items: [
            {
              label: 'Operating Systems',
              to: '/docs/platforms/operating-systems/',
            },
          ],
        },

        {
          title: 'Community',

          items: [
            {
              html: '<a href="https://github.com/Computer-Technician-Tools/CTT" aria-label="CTT on GitHub" title="GitHub" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:.5rem"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.61 1.22 3.25.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/></svg><span>GitHub</span></a>',
            },
            {
              html: '<a href="https://discord.gg/GtQRHZeHWK" aria-label="CTT on Discord" title="Discord" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:.5rem"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M19.7 5.3a18.2 18.2 0 0 0-4.5-1.4l-.6 1.2a16.8 16.8 0 0 0-5.1 0l-.6-1.2a18.1 18.1 0 0 0-4.5 1.4C1.6 9.5.8 13.6 1.2 17.6a18.2 18.2 0 0 0 5.5 2.8l1.2-2a11.8 11.8 0 0 1-1.9-.9l.5-.4a13 13 0 0 0 11 0l.5.4a12 12 0 0 1-1.9.9l1.2 2a18.1 18.1 0 0 0 5.5-2.8c.5-4.6-.8-8.7-3.1-12.3ZM8.8 14.8c-1.1 0-2-.9-2-2.1s.9-2.1 2-2.1 2 .9 2 2.1-.9 2.1-2 2.1Zm6.4 0c-1.1 0-2-.9-2-2.1s.9-2.1 2-2.1 2 .9 2 2.1-.9 2.1-2 2.1Z"/></svg><span>Discord</span></a>',
            },
          ],
        },
      ],

      copyright: `Copyright © ${new Date().getFullYear()} Computer Technician Tools.`,
    },

    // ----------------------------------------------------------
    // CODE BLOCKS
    // ----------------------------------------------------------

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
