import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  technicianSidebar: [
    // ============================================================
    // GETTING STARTED
    // ============================================================

    'getting-started',

    // ============================================================
    // TOOLS
    // ============================================================

    {
      type: 'category',
      label: 'Tools',
      collapsible: true,
      collapsed: true,

      items: [
        {
          type: 'category',
          label: 'Utilities',
          description:
            'Utilities for system maintenance, recovery, conversion, and other technician tasks.',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/utilities/index',
          },
          items: [],
        },
        {
          type: 'category',
          label: 'Diagnostics',
          description:
            'Hardware, software, system, and troubleshooting diagnostic tools.',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/diagnostics/index',
          },
          items: [],
        },
        {
          type: 'category',
          label: 'Privacy & Security',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/security/index',
          },
          items: [],
        },
        {
          type: 'category',
          label: 'Benchmark',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/benchmark/index',
          },
          items: [],
        },
        {
          type: 'category',
          label: 'Guides',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/guides/index',
          },
          items: [],
        },
        {
          type: 'category',
          label: 'Network',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'tools/network/index',
          },
          items: [],
        },
      ],
    },

    // ============================================================
    // OPTICAL DEVICES
    // ============================================================

    {
      type: 'category',
      label: 'Optical Devices',
      collapsible: true,
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'optical-media/index',
        },
      ],
    },

    // ============================================================
    // PLATFORMS
    // ============================================================

    {
      type: 'category',
      label: 'Platforms',
      collapsible: true,
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Operating Systems',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'platforms/operating-systems/index',
          },
          items: [
            {
              type: 'category',
              label: 'Windows',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/windows/index',
              },
              items: [
                'platforms/operating-systems/windows/commands',
                'platforms/operating-systems/windows/guides',
                'platforms/operating-systems/windows/networking',
                'platforms/operating-systems/windows/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'Linux',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/linux/index',
              },
              items: [
                'platforms/operating-systems/linux/commands',
                'platforms/operating-systems/linux/repair',
                'platforms/operating-systems/linux/networking',
                'platforms/operating-systems/linux/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'macOS',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/macos/index',
              },
              items: [],
            },
            {
              type: 'category',
              label: 'ChromeOS',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/chromeos/index',
              },
              items: [],
            },
            {
              type: 'category',
              label: 'BSD',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/bsd/index',
              },
              items: [
                {
                  type: 'doc',
                  id: 'platforms/operating-systems/bsd/freebsd/index',
                  label: 'FreeBSD',
                },
                {
                  type: 'doc',
                  id: 'platforms/operating-systems/bsd/openbsd/index',
                  label: 'OpenBSD',
                },
                {
                  type: 'doc',
                  id: 'platforms/operating-systems/bsd/netbsd/index',
                  label: 'NetBSD',
                },
              ],
            },
            {
              type: 'category',
              label: 'Other',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/operating-systems/other/index',
              },
              items: [],
            },
          ],
        },

        {
          type: 'category',
          label: 'Mobile',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'platforms/mobile/index',
          },
          items: [
            {
              type: 'category',
              label: 'Android',
              description: 'Android phone and carrier reference material.',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/mobile/android/index',
              },
              items: [
                'platforms/mobile/android/diagnostics',
                'platforms/mobile/android/repair',
                'platforms/mobile/android/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'iOS',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/mobile/ios/index',
              },
              items: [],
            },
          ],
        },

        {
          type: 'category',
          label: 'Browsers',
          collapsible: true,
          collapsed: true,

          items: [
            {
              type: 'doc',
              id: 'platforms/browsers/index',
            },

            {
              type: 'category',
              label: 'Chrome',
              collapsible: true,
              collapsed: true,
              items: [
                'platforms/browsers/chrome/index',
              ],
            },

            {
              type: 'category',
              label: 'Firefox',
              collapsible: true,
              collapsed: true,
              items: [
                'platforms/browsers/firefox/index',
              ],
            },

            {
              type: 'category',
              label: 'Edge',
              collapsible: true,
              collapsed: true,
              items: [
                'platforms/browsers/edge/index',
              ],
            },

            {
              type: 'category',
              label: 'Other',
              collapsible: true,
              collapsed: true,
              items: [
                'platforms/browsers/other/extensions',
                'platforms/browsers/other/settings',
              ],
            },
          ],
        },

        {
          type: 'category',
          label: 'Servers',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'platforms/servers/index',
          },
          items: [
            {
              type: 'category',
              label: 'Windows Server',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/servers/windows-server/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Linux Server',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/servers/linux-server/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Other',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/servers/other/index'},
              items: [],
            },
          ],
        },

        {
          type: 'category',
          label: 'Gaming',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'platforms/gaming/index',
          },
          items: [
            {
              type: 'category',
              label: 'Consoles',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/gaming/consoles/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Handhelds',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/gaming/handhelds/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Emulators',
              collapsible: true,
              collapsed: true,
              link: {
                type: 'doc',
                id: 'platforms/gaming/emulators/index',
              },
              items: [],
            },
          ],
        },

        {
          type: 'category',
          label: 'Embedded',
          collapsible: true,
          collapsed: true,
          link: {
            type: 'doc',
            id: 'platforms/embedded/index',
          },
          items: [
            {
              type: 'category',
              label: 'Raspberry Pi',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/embedded/raspberry-pi/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Routers',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/embedded/routers/index'},
              items: [],
            },
            {
              type: 'category',
              label: 'Other',
              collapsible: true,
              collapsed: true,
              link: {type: 'doc', id: 'platforms/embedded/other/index'},
              items: [],
            },
          ],
        },
      ],
    },
  ],
};

export default sidebars;
