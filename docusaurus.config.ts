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
    faster: true,
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
  ],

  // ============================================================
  // IDEAL IMAGE PLUGIN
  // ============================================================

  // Responsive, lazy-loaded documentation images with generated
  // resized variants and a low-quality placeholder.
  // PNG and JPG image imports are supported by the plugin.
  plugins: [
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

          showLastUpdateTime: true,
          showLastUpdateAuthor: true,

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
          customCss: './src/css/custom.css',
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
        hashed: true,

        // Search documentation written in English.
        language: ['en'],

        // Index docs and normal Docusaurus pages.
        indexDocs: true,
        indexBlog: false,
        indexPages: true,

        // Highlight matching terms after opening a result.
        highlightSearchTermsOnTargetPage: true,

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
        src: '/img/logo.png',
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
      ],

      copyright: `Copyright © ${new Date().getFullYear()} Computer Technician Tools. Built with Docusaurus.`,
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
