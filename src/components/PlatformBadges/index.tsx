import type {ReactNode} from 'react';

import simpleIconsJson from '@iconify-json/simple-icons/icons.json';
import logosJson from '@iconify-json/logos/icons.json';
import materialSymbolsJson from '@iconify-json/material-symbols/icons.json';

import styles from './styles.module.css';

type IconData = {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
};

type IconSet = {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  icons?: Record<string, IconData>;
};

type SvgIcon = {
  body: string;
  width: number;
  height: number;
  left: number;
  top: number;
};

type IconCandidate = {
  set: IconSet;
  names: string[];
};

type BadgeType =
  // ============================================================
  // OPERATING SYSTEMS
  // ============================================================

  | 'windows'
  | 'macos'
  | 'linux'
  | 'android'
  | 'ios'
  | 'chromeos'
  | 'ubuntu'
  | 'debian'
  | 'fedora'
  | 'arch'
  | 'freebsd'
  | 'openbsd'
  | 'netbsd'
  | 'raspberry-pi'
  | 'steamos'
  | 'haiku'
  | 'solaris'
  | 'illumos'
  | 'openwrt'
  | 'opnsense'
  | 'pfsense'

  // ============================================================
  // DEVICES / HARDWARE
  // ============================================================

  | 'bootable'
  | 'cross'
  | 'mobile'
  | 'desktop'
  | 'server'
  | 'vm'
  | 'docker'
  | 'steam-deck'
  | 'synology'
  | 'proxmox'
  | 'vmware'
  | 'raspberry-pi'

  // ============================================================
  // GAME PLATFORMS
  // ============================================================

  | 'playstation'
  | 'xbox'
  | 'nintendo'
  | 'switch'

  // ============================================================
  // BROWSERS
  // ============================================================

  | 'chrome'
  | 'firefox'
  | 'edge'
  | 'safari'
  | 'opera'
  | 'brave'
  | 'vivaldi'
  | 'tor'
  | 'librewolf'

  // ============================================================
  // SOURCE / DEVELOPMENT PLATFORMS
  // ============================================================

  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'codeberg'
  | 'gitea'
  | 'forgejo'
  | 'sourceforge'
  | 'git'
  | 'code'

  // ============================================================
  // LICENSING
  // ============================================================

  | 'opensource'
  | 'closed-source'
  | 'free'
  | 'paid'
  | 'freemium'

  // ============================================================
  // APPLICATION TYPE
  // ============================================================

  | 'portable'
  | 'cli'
  | 'gui'
  | 'web'
  | 'desktop-app'
  | 'mobile-app'

  // ============================================================
  // CONNECTIVITY
  // ============================================================

  | 'offline'
  | 'online'
  | 'cloud'
  | 'api'

  // ============================================================
  // PERMISSIONS
  // ============================================================

  | 'admin'
  | 'root'

  // ============================================================
  // OTHER SERVICES
  // ============================================================

  | 'social'
  | 'recommended'
  | 'official'
  | 'third-party'
  | 'warning'
  | 'experimental';

const simpleIcons = simpleIconsJson as unknown as IconSet;
const logos = logosJson as unknown as IconSet;
const materialSymbols = materialSymbolsJson as unknown as IconSet;

// ============================================================
// FALLBACK
// ============================================================

const fallbackIcon: SvgIcon = {
  body: `
    <path
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
      fill="currentColor"
    />
  `,
  width: 24,
  height: 24,
  left: 0,
  top: 0,
};

// ============================================================
// ICON LOOKUP
// ============================================================

function normalizeIconName(name: string): string[] {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');

  return [
    normalized,
    normalized.replace(/-/g, ''),
  ];
}

function getIcon(
  candidates: IconCandidate[],
): SvgIcon {
  for (const candidate of candidates) {
    for (const name of candidate.names) {
      const names = normalizeIconName(name);

      for (const normalizedName of names) {
        const icon = candidate.set.icons?.[normalizedName];

        if (!icon) {
          continue;
        }

        return {
          body: icon.body,
          width: icon.width ?? candidate.set.width ?? 24,
          height: icon.height ?? candidate.set.height ?? 24,
          left: icon.left ?? candidate.set.left ?? 0,
          top: icon.top ?? candidate.set.top ?? 0,
        };
      }
    }
  }

  return fallbackIcon;
}

type Badge = {
  // Either an inline SVG icon from an Iconify set, or a raster image (used for
  // platforms whose official artwork is a bitmap, such as the macOS Finder icon).
  icon?: SvgIcon;
  image?: {src: string; alt?: string; wordmark?: boolean};
  label: string;
};

// ============================================================
// BADGES
// ============================================================

const badges: Partial<Record<BadgeType, Badge>> = {
  // ============================================================
  // OPERATING SYSTEMS
  // ============================================================

  windows: {
    icon: getIcon([
      {set: simpleIcons, names: ['windows']},
      {set: logos, names: ['windows']},
    ]),
    label: 'Windows',
  },

  macos: {
    // Official macOS wordmark from Wikimedia Commons:
    // File:MacOS wordmark (2017).svg (320px PNG thumbnail).
    image: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/MacOS_wordmark_(2017).svg/320px-MacOS_wordmark_(2017).svg.png',
      alt: 'macOS',
      wordmark: true,
    },
    label: 'macOS',
  },

  linux: {
    icon: getIcon([
      {set: simpleIcons, names: ['linux']},
      {set: logos, names: ['linux']},
    ]),
    label: 'Linux',
  },

  android: {
    icon: getIcon([
      {set: simpleIcons, names: ['android']},
      {set: logos, names: ['android']},
    ]),
    label: 'Android',
  },

  // Apple logo for iOS (macOS uses the Finder icon above).
  ios: {
    icon: getIcon([
      {set: simpleIcons, names: ['apple']},
      {set: logos, names: ['apple']},
    ]),
    label: 'iOS',
  },

  chromeos: {
    icon: getIcon([
      {set: simpleIcons, names: ['chromeos']},
      {set: logos, names: ['chrome']},
    ]),
    label: 'ChromeOS',
  },

  ubuntu: {
    icon: getIcon([
      {set: simpleIcons, names: ['ubuntu']},
      {set: logos, names: ['ubuntu']},
    ]),
    label: 'Ubuntu',
  },

  debian: {
    icon: getIcon([
      {set: simpleIcons, names: ['debian']},
      {set: logos, names: ['debian']},
    ]),
    label: 'Debian',
  },

  fedora: {
    icon: getIcon([
      {set: simpleIcons, names: ['fedora']},
      {set: logos, names: ['fedora']},
    ]),
    label: 'Fedora',
  },

  arch: {
    icon: getIcon([
      {set: simpleIcons, names: ['archlinux']},
      {set: logos, names: ['archlinux']},
    ]),
    label: 'Arch Linux',
  },

  freebsd: {
    icon: getIcon([
      {set: simpleIcons, names: ['freebsd']},
      {set: logos, names: ['freebsd']},
    ]),
    label: 'FreeBSD',
  },

  openbsd: {
    icon: getIcon([
      {set: simpleIcons, names: ['openbsd']},
      {set: logos, names: ['openbsd']},
    ]),
    label: 'OpenBSD',
  },

  netbsd: {
    icon: getIcon([
      {set: simpleIcons, names: ['netbsd']},
      {set: logos, names: ['netbsd']},
    ]),
    label: 'NetBSD',
  },

  'raspberry-pi': {
    icon: getIcon([
      {set: simpleIcons, names: ['raspberrypi']},
      {set: logos, names: ['raspberry-pi', 'raspberrypi']},
    ]),
    label: 'Raspberry Pi',
  },

  steamos: {
    icon: getIcon([
      {set: simpleIcons, names: ['steam']},
      {set: logos, names: ['steam']},
    ]),
    label: 'SteamOS',
  },

  haiku: {
    icon: getIcon([
      {set: simpleIcons, names: ['haiku']},
      {set: logos, names: ['haiku']},
    ]),
    label: 'Haiku',
  },

  solaris: {
    icon: getIcon([
      {set: simpleIcons, names: ['oracle']},
      {set: logos, names: ['oracle']},
    ]),
    label: 'Solaris',
  },

  illumos: {
    icon: getIcon([
      {set: simpleIcons, names: ['illumos']},
      {set: logos, names: ['illumos']},
    ]),
    label: 'illumos',
  },

  openwrt: {
    icon: getIcon([
      {set: simpleIcons, names: ['openwrt']},
      {set: logos, names: ['openwrt']},
    ]),
    label: 'OpenWrt',
  },

  opnsense: {
    icon: getIcon([
      {set: simpleIcons, names: ['opnsense']},
      {set: logos, names: ['opnsense']},
    ]),
    label: 'OPNsense',
  },

  pfsense: {
    icon: getIcon([
      {set: simpleIcons, names: ['pfsense']},
      {set: logos, names: ['pfsense']},
    ]),
    label: 'pfSense',
  },

  // ============================================================
  // DEVICES / HARDWARE
  // ============================================================

  bootable: {
    icon: getIcon([
      {set: materialSymbols, names: ['usb-rounded']},
    ]),
    label: 'Bootable USB',
  },

  cross: {
    icon: getIcon([
      {set: materialSymbols, names: ['devices-rounded']},
    ]),
    label: 'Cross-platform',
  },

  mobile: {
    icon: getIcon([
      {set: materialSymbols, names: ['smartphone']},
    ]),
    label: 'Mobile',
  },

  desktop: {
    icon: getIcon([
      {set: materialSymbols, names: ['desktop-windows']},
    ]),
    label: 'Desktop',
  },

  server: {
    icon: getIcon([
      {set: materialSymbols, names: ['dns']},
    ]),
    label: 'Server',
  },

  vm: {
    icon: getIcon([
      {set: simpleIcons, names: ['virtualbox']},
      {set: simpleIcons, names: ['vmware']},
      {set: materialSymbols, names: ['computer']},
    ]),
    label: 'Virtual Machine',
  },

  docker: {
    icon: getIcon([
      {set: simpleIcons, names: ['docker']},
      {set: logos, names: ['docker']},
    ]),
    label: 'Docker',
  },

  'steam-deck': {
    icon: getIcon([
      {set: simpleIcons, names: ['steam']},
      {set: logos, names: ['steam']},
    ]),
    label: 'Steam Deck',
  },

  synology: {
    icon: getIcon([
      {set: simpleIcons, names: ['synology']},
      {set: logos, names: ['synology']},
    ]),
    label: 'Synology',
  },

  proxmox: {
    icon: getIcon([
      {set: simpleIcons, names: ['proxmox']},
      {set: logos, names: ['proxmox']},
    ]),
    label: 'Proxmox',
  },

  vmware: {
    icon: getIcon([
      {set: simpleIcons, names: ['vmware']},
      {set: logos, names: ['vmware']},
    ]),
    label: 'VMware',
  },

  // ============================================================
  // GAME PLATFORMS
  // ============================================================

  playstation: {
    icon: getIcon([
      {set: simpleIcons, names: ['playstation']},
      {set: logos, names: ['playstation']},
    ]),
    label: 'PlayStation',
  },

  xbox: {
    icon: getIcon([
      {set: simpleIcons, names: ['xbox']},
      {set: logos, names: ['xbox']},
    ]),
    label: 'Xbox',
  },

  nintendo: {
    icon: getIcon([
      {set: simpleIcons, names: ['nintendo']},
      {set: logos, names: ['nintendo']},
    ]),
    label: 'Nintendo',
  },

  switch: {
    icon: getIcon([
      {set: simpleIcons, names: ['nintendoswitch']},
      {set: logos, names: ['nintendo-switch']},
    ]),
    label: 'Nintendo Switch',
  },

  // ============================================================
  // BROWSERS
  // ============================================================

  chrome: {
    icon: getIcon([
      {set: simpleIcons, names: ['googlechrome']},
      {set: logos, names: ['chrome']},
    ]),
    label: 'Google Chrome',
  },

  firefox: {
    icon: getIcon([
      {set: simpleIcons, names: ['firefox']},
      {set: logos, names: ['firefox']},
    ]),
    label: 'Firefox',
  },

  edge: {
    icon: getIcon([
      {set: simpleIcons, names: ['microsoftedge']},
      {set: logos, names: ['microsoft-edge']},
    ]),
    label: 'Microsoft Edge',
  },

  safari: {
    icon: getIcon([
      {set: simpleIcons, names: ['safari']},
      {set: logos, names: ['safari']},
    ]),
    label: 'Safari',
  },

  opera: {
    icon: getIcon([
      {set: simpleIcons, names: ['opera']},
      {set: logos, names: ['opera']},
    ]),
    label: 'Opera',
  },

  brave: {
    icon: getIcon([
      {set: simpleIcons, names: ['brave']},
      {set: logos, names: ['brave']},
    ]),
    label: 'Brave',
  },

  vivaldi: {
    icon: getIcon([
      {set: simpleIcons, names: ['vivaldi']},
      {set: logos, names: ['vivaldi']},
    ]),
    label: 'Vivaldi',
  },

  tor: {
    icon: getIcon([
      {set: simpleIcons, names: ['torbrowser']},
      {set: logos, names: ['tor']},
    ]),
    label: 'Tor Browser',
  },

  librewolf: {
    icon: getIcon([
      {set: simpleIcons, names: ['librewolf']},
      {set: logos, names: ['librewolf']},
    ]),
    label: 'LibreWolf',
  },

  // ============================================================
  // SOURCE / DEVELOPMENT PLATFORMS
  // ============================================================

  github: {
    icon: getIcon([
      {set: simpleIcons, names: ['github']},
      {set: logos, names: ['github']},
    ]),
    label: 'GitHub',
  },

  gitlab: {
    icon: getIcon([
      {set: simpleIcons, names: ['gitlab']},
      {set: logos, names: ['gitlab']},
    ]),
    label: 'GitLab',
  },

  bitbucket: {
    icon: getIcon([
      {set: simpleIcons, names: ['bitbucket']},
      {set: logos, names: ['bitbucket']},
    ]),
    label: 'Bitbucket',
  },

  codeberg: {
    icon: getIcon([
      {set: simpleIcons, names: ['codeberg']},
      {set: logos, names: ['codeberg']},
    ]),
    label: 'Codeberg',
  },

  gitea: {
    icon: getIcon([
      {set: simpleIcons, names: ['gitea']},
      {set: logos, names: ['gitea']},
    ]),
    label: 'Gitea',
  },

  forgejo: {
    icon: getIcon([
      {set: simpleIcons, names: ['forgejo']},
      {set: logos, names: ['forgejo']},
    ]),
    label: 'Forgejo',
  },

  sourceforge: {
    icon: getIcon([
      {set: simpleIcons, names: ['sourceforge']},
      {set: logos, names: ['sourceforge']},
    ]),
    label: 'SourceForge',
  },

  git: {
    icon: getIcon([
      {set: simpleIcons, names: ['git']},
      {set: logos, names: ['git']},
    ]),
    label: 'Git',
  },

  code: {
    icon: getIcon([
      {set: materialSymbols, names: ['code']},
    ]),
    label: 'Source code',
  },

  // ============================================================
  // LICENSING
  // ============================================================

  opensource: {
    icon: getIcon([
      {set: simpleIcons, names: ['opensourceinitiative']},
      {set: materialSymbols, names: ['code']},
    ]),
    label: 'Open Source',
  },

  'closed-source': {
    icon: getIcon([
      {set: materialSymbols, names: ['lock']},
    ]),
    label: 'Closed Source',
  },

  free: {
    icon: getIcon([
      {set: materialSymbols, names: ['money-off']},
    ]),
    label: 'Free',
  },

  paid: {
    icon: getIcon([
      {set: materialSymbols, names: ['payments']},
    ]),
    label: 'Paid',
  },

  freemium: {
    icon: getIcon([
      {set: materialSymbols, names: ['sell']},
    ]),
    label: 'Freemium',
  },

  // ============================================================
  // APPLICATION TYPE
  // ============================================================

  portable: {
    icon: getIcon([
      {set: materialSymbols, names: ['folder-open']},
    ]),
    label: 'Portable',
  },

  cli: {
    icon: getIcon([
      {set: materialSymbols, names: ['terminal']},
    ]),
    label: 'CLI',
  },

  gui: {
    icon: getIcon([
      {set: materialSymbols, names: ['desktop-windows']},
    ]),
    label: 'GUI',
  },

  web: {
    icon: getIcon([
      {set: materialSymbols, names: ['language']},
    ]),
    label: 'Web',
  },

  'desktop-app': {
    icon: getIcon([
      {set: materialSymbols, names: ['desktop-windows']},
    ]),
    label: 'Desktop application',
  },

  'mobile-app': {
    icon: getIcon([
      {set: materialSymbols, names: ['smartphone']},
    ]),
    label: 'Mobile application',
  },

  // ============================================================
  // CONNECTIVITY
  // ============================================================

  offline: {
    icon: getIcon([
      {set: materialSymbols, names: ['cloud-off']},
    ]),
    label: 'Offline',
  },

  online: {
    icon: getIcon([
      {set: materialSymbols, names: ['cloud']},
    ]),
    label: 'Online',
  },

  cloud: {
    icon: getIcon([
      {set: materialSymbols, names: ['cloud']},
    ]),
    label: 'Cloud',
  },

  api: {
    icon: getIcon([
      {set: materialSymbols, names: ['api']},
    ]),
    label: 'API',
  },

  // ============================================================
  // PERMISSIONS
  // ============================================================

  admin: {
    icon: getIcon([
      {set: materialSymbols, names: ['admin-panel-settings']},
    ]),
    label: 'Administrator',
  },

  root: {
    icon: getIcon([
      {set: materialSymbols, names: ['security']},
    ]),
    label: 'Root',
  },

  // ============================================================
  // OTHER
  // ============================================================

  social: {
    icon: getIcon([
      {set: materialSymbols, names: ['share']},
    ]),
    label: 'Social Media',
  },

  recommended: {
    icon: getIcon([
      {set: materialSymbols, names: ['star']},
    ]),
    label: 'Recommended',
  },

  official: {
    icon: getIcon([
      {set: materialSymbols, names: ['verified']},
    ]),
    label: 'Official',
  },

  'third-party': {
    icon: getIcon([
      {set: materialSymbols, names: ['extension']},
    ]),
    label: 'Third-party',
  },

  warning: {
    icon: getIcon([
      {set: materialSymbols, names: ['warning']},
    ]),
    label: 'Warning',
  },

  experimental: {
    icon: getIcon([
      {set: materialSymbols, names: ['science']},
    ]),
    label: 'Experimental',
  },
};

// ============================================================
// COMPONENT
// ============================================================

type PlatformBadgesProps = {
  items: BadgeType[];
};

export default function PlatformBadges({
  items,
}: PlatformBadgesProps): ReactNode {
  const validItems = items.filter(
    (item): item is BadgeType => Boolean(badges[item]),
  );

  if (validItems.length === 0) {
    return null;
  }

  return (
    <span
      className={styles.badges}
      data-ctt-icons=""
      aria-label={`Supported platforms: ${validItems
        .map((item) => badges[item]!.label)
        .join(', ')}`}
    >
      {validItems.map((item) => {
        const badge = badges[item];

        if (!badge) {
          return null;
        }

        return (
          <span
            className={styles.badge}
            key={item}
            title={badge.label}
            aria-label={badge.label}
            data-platform={item}
          >
            {badge.image ? (
              <img
                className={badge.image.wordmark ? styles.wordmark : styles.icon}
                src={badge.image.src}
                alt={badge.image.alt ?? ''}
                loading="lazy"
                decoding="async"
              />
            ) : badge.icon ? (
              <svg
                aria-hidden="true"
                className={styles.icon}
                focusable="false"
                viewBox={`${badge.icon.left} ${badge.icon.top} ${badge.icon.width} ${badge.icon.height}`}
                dangerouslySetInnerHTML={{
                  __html: badge.icon.body,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </span>
  );
}