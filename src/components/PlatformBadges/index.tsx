import type {ReactNode} from 'react';

import {simpleIcons, logos, materialSymbols} from '@site/src/generated/platform-icons';

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

const simpleIconSet = simpleIcons as unknown as IconSet;
const logoSet = logos as unknown as IconSet;
const materialSymbolSet = materialSymbols as unknown as IconSet;

// ============================================================
// FALLBACK
// ============================================================

const fallbackIcon: SvgIcon = {
  body: '<path d="M5 5h14v14H5z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12h8" fill="none" stroke="currentColor" stroke-width="1.5"/>',
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
  // Either an inline SVG icon from the legacy icon sets or an SVG Repo asset.
  // SVG Repo assets are kept as SVG files/URLs to preserve their original artwork.
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
      {set: simpleIconSet, names: ['windows']},
      {set: logoSet, names: ['windows']},
    ]),
    label: 'Windows',
  },

  macos: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['laptop-mac']},
    ]),
    label: 'macOS',
  },

  linux: {
    icon: getIcon([
      {set: simpleIconSet, names: ['linux']},
      {set: logoSet, names: ['linux']},
    ]),
    label: 'Linux',
  },

  android: {
    icon: getIcon([
      {set: simpleIconSet, names: ['android']},
      {set: logoSet, names: ['android']},
    ]),
    label: 'Android',
  },

  ios: {
    icon: getIcon([
      {set: simpleIconSet, names: ['apple']},
      {set: logoSet, names: ['apple']},
    ]),
    label: 'iOS',
  },

  chromeos: {
    icon: getIcon([
      {set: simpleIconSet, names: ['chromeos']},
      {set: logoSet, names: ['chrome']},
      {set: materialSymbolSet, names: ['laptop-chromebook']},
    ]),
    label: 'ChromeOS',
  },

  ubuntu: {
    icon: getIcon([
      {set: simpleIconSet, names: ['ubuntu']},
      {set: logoSet, names: ['ubuntu']},
    ]),
    label: 'Ubuntu',
  },

  debian: {
    icon: getIcon([
      {set: simpleIconSet, names: ['debian']},
      {set: logoSet, names: ['debian']},
    ]),
    label: 'Debian',
  },

  fedora: {
    icon: getIcon([
      {set: simpleIconSet, names: ['fedora']},
      {set: logoSet, names: ['fedora']},
    ]),
    label: 'Fedora',
  },

  arch: {
    icon: getIcon([
      {set: simpleIconSet, names: ['archlinux']},
      {set: logoSet, names: ['archlinux']},
    ]),
    label: 'Arch Linux',
  },

  freebsd: {
    icon: getIcon([
      {set: simpleIconSet, names: ['freebsd']},
      {set: logoSet, names: ['freebsd']},
    ]),
    label: 'FreeBSD',
  },

  openbsd: {
    icon: getIcon([
      {set: simpleIconSet, names: ['openbsd']},
      {set: logoSet, names: ['openbsd']},
    ]),
    label: 'OpenBSD',
  },

  netbsd: {
    icon: getIcon([
      {set: simpleIconSet, names: ['netbsd']},
      {set: logoSet, names: ['netbsd']},
    ]),
    label: 'NetBSD',
  },

  'raspberry-pi': {
    icon: getIcon([
      {set: simpleIconSet, names: ['raspberrypi']},
      {set: logoSet, names: ['raspberry-pi', 'raspberrypi']},
    ]),
    label: 'Raspberry Pi',
  },

  steamos: {
    icon: getIcon([
      {set: simpleIconSet, names: ['steam']},
      {set: logoSet, names: ['steam']},
    ]),
    label: 'SteamOS',
  },

  haiku: {
    icon: getIcon([
      {set: simpleIconSet, names: ['haiku']},
      {set: logoSet, names: ['haiku']},
    ]),
    label: 'Haiku',
  },

  solaris: {
    icon: getIcon([
      {set: simpleIconSet, names: ['oracle']},
      {set: logoSet, names: ['oracle']},
    ]),
    label: 'Solaris',
  },

  illumos: {
    icon: getIcon([
      {set: simpleIconSet, names: ['illumos']},
      {set: logoSet, names: ['illumos']},
    ]),
    label: 'illumos',
  },

  openwrt: {
    icon: getIcon([
      {set: simpleIconSet, names: ['openwrt']},
      {set: logoSet, names: ['openwrt']},
    ]),
    label: 'OpenWrt',
  },

  opnsense: {
    icon: getIcon([
      {set: simpleIconSet, names: ['opnsense']},
      {set: logoSet, names: ['opnsense']},
    ]),
    label: 'OPNsense',
  },

  pfsense: {
    icon: getIcon([
      {set: simpleIconSet, names: ['pfsense']},
      {set: logoSet, names: ['pfsense']},
    ]),
    label: 'pfSense',
  },

  // ============================================================
  // DEVICES / HARDWARE
  // ============================================================

  bootable: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['usb-rounded']},
    ]),
    label: 'Bootable USB',
  },

  cross: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['devices-rounded']},
    ]),
    label: 'Cross-platform',
  },

  mobile: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['phone-android-outline']},
    ]),
    label: 'Mobile',
  },

  desktop: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['desktop-windows']},
    ]),
    label: 'Desktop',
  },
  
  server: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['dns']},
    ]),
    label: 'Server',
  },

  vm: {
    icon: getIcon([
      {set: simpleIconSet, names: ['virtualbox']},
      {set: simpleIconSet, names: ['vmware']},
      {set: materialSymbolSet, names: ['computer']},
    ]),
    label: 'Virtual Machine',
  },

  docker: {
    icon: getIcon([
      {set: simpleIconSet, names: ['docker']},
      {set: logoSet, names: ['docker']},
    ]),
    label: 'Docker',
  },

  'steam-deck': {
    icon: getIcon([
      {set: simpleIconSet, names: ['steam']},
      {set: logoSet, names: ['steam']},
    ]),
    label: 'Steam Deck',
  },

  synology: {
    icon: getIcon([
      {set: simpleIconSet, names: ['synology']},
      {set: logoSet, names: ['synology']},
    ]),
    label: 'Synology',
  },

  proxmox: {
    icon: getIcon([
      {set: simpleIconSet, names: ['proxmox']},
      {set: logoSet, names: ['proxmox']},
    ]),
    label: 'Proxmox',
  },

  vmware: {
    icon: getIcon([
      {set: simpleIconSet, names: ['vmware']},
      {set: logoSet, names: ['vmware']},
    ]),
    label: 'VMware',
  },

  // ============================================================
  // GAME PLATFORMS
  // ============================================================

  playstation: {
    icon: getIcon([
      {set: simpleIconSet, names: ['playstation']},
      {set: logoSet, names: ['playstation']},
    ]),
    label: 'PlayStation',
  },

  xbox: {
    icon: getIcon([
      {set: simpleIconSet, names: ['xbox']},
      {set: logoSet, names: ['xbox']},
    ]),
    label: 'Xbox',
  },

  nintendo: {
    icon: getIcon([
      {set: simpleIconSet, names: ['nintendo']},
      {set: logoSet, names: ['nintendo']},
    ]),
    label: 'Nintendo',
  },

  switch: {
    icon: getIcon([
      {set: simpleIconSet, names: ['nintendoswitch']},
      {set: logoSet, names: ['nintendo-switch']},
    ]),
    label: 'Nintendo Switch',
  },

  // ============================================================
  // BROWSERS
  // ============================================================

  chrome: {
    icon: getIcon([
      {set: simpleIconSet, names: ['googlechrome']},
      {set: logoSet, names: ['chrome']},
    ]),
    label: 'Google Chrome',
  },

  firefox: {
    icon: getIcon([
      {set: simpleIconSet, names: ['firefox']},
      {set: logoSet, names: ['firefox']},
    ]),
    label: 'Firefox',
  },

  edge: {
    icon: getIcon([
      {set: simpleIconSet, names: ['microsoftedge']},
      {set: logoSet, names: ['microsoft-edge']},
    ]),
    label: 'Microsoft Edge',
  },

  safari: {
    icon: getIcon([
      {set: simpleIconSet, names: ['safari']},
      {set: logoSet, names: ['safari']},
    ]),
    label: 'Safari',
  },

  opera: {
    icon: getIcon([
      {set: simpleIconSet, names: ['opera']},
      {set: logoSet, names: ['opera']},
    ]),
    label: 'Opera',
  },

  brave: {
    icon: getIcon([
      {set: simpleIconSet, names: ['brave']},
      {set: logoSet, names: ['brave']},
    ]),
    label: 'Brave',
  },

  vivaldi: {
    icon: getIcon([
      {set: simpleIconSet, names: ['vivaldi']},
      {set: logoSet, names: ['vivaldi']},
    ]),
    label: 'Vivaldi',
  },

  tor: {
    icon: getIcon([
      {set: simpleIconSet, names: ['torbrowser']},
      {set: logoSet, names: ['tor']},
    ]),
    label: 'Tor Browser',
  },

  librewolf: {
    icon: getIcon([
      {set: simpleIconSet, names: ['librewolf']},
      {set: logoSet, names: ['librewolf']},
    ]),
    label: 'LibreWolf',
  },

  // ============================================================
  // SOURCE / DEVELOPMENT PLATFORMS
  // ============================================================

  github: {
    icon: getIcon([
      {set: simpleIconSet, names: ['github']},
      {set: logoSet, names: ['github']},
    ]),
    label: 'GitHub',
  },

  gitlab: {
    icon: getIcon([
      {set: simpleIconSet, names: ['gitlab']},
      {set: logoSet, names: ['gitlab']},
    ]),
    label: 'GitLab',
  },

  bitbucket: {
    icon: getIcon([
      {set: simpleIconSet, names: ['bitbucket']},
      {set: logoSet, names: ['bitbucket']},
    ]),
    label: 'Bitbucket',
  },

  codeberg: {
    icon: getIcon([
      {set: simpleIconSet, names: ['codeberg']},
      {set: logoSet, names: ['codeberg']},
    ]),
    label: 'Codeberg',
  },

  gitea: {
    icon: getIcon([
      {set: simpleIconSet, names: ['gitea']},
      {set: logoSet, names: ['gitea']},
    ]),
    label: 'Gitea',
  },

  forgejo: {
    icon: getIcon([
      {set: simpleIconSet, names: ['forgejo']},
      {set: logoSet, names: ['forgejo']},
    ]),
    label: 'Forgejo',
  },

  sourceforge: {
    icon: getIcon([
      {set: simpleIconSet, names: ['sourceforge']},
      {set: logoSet, names: ['sourceforge']},
    ]),
    label: 'SourceForge',
  },

  git: {
    icon: getIcon([
      {set: simpleIconSet, names: ['git']},
      {set: logoSet, names: ['git']},
    ]),
    label: 'Git',
  },

  code: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['code']},
    ]),
    label: 'Source code',
  },

  // ============================================================
  // LICENSING
  // ============================================================

  opensource: {
    icon: getIcon([
      {set: simpleIconSet, names: ['opensourceinitiative']},
      {set: materialSymbolSet, names: ['code']},
    ]),
    label: 'Open Source',
  },

  'closed-source': {
    icon: getIcon([
      {set: materialSymbolSet, names: ['lock']},
    ]),
    label: 'Closed Source',
  },

  free: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['money-off']},
    ]),
    label: 'Free',
  },

  paid: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['payments']},
    ]),
    label: 'Paid',
  },

  freemium: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['sell']},
    ]),
    label: 'Freemium',
  },

  // ============================================================
  // APPLICATION TYPE
  // ============================================================

  portable: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['folder-open']},
    ]),
    label: 'Portable',
  },

  cli: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['terminal']},
    ]),
    label: 'CLI',
  },

  gui: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['desktop-windows']},
    ]),
    label: 'GUI',
  },

  web: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['language']},
    ]),
    label: 'Web',
  },

  'desktop-app': {
    icon: getIcon([
      {set: materialSymbolSet, names: ['desktop-windows']},
    ]),
    label: 'Desktop application',
  },

  'mobile-app': {
    icon: getIcon([
      {set: materialSymbolSet, names: ['phone-android-outline']},
    ]),
    label: 'Mobile application',
  },

  // ============================================================
  // CONNECTIVITY
  // ============================================================

  offline: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['cloud-off']},
    ]),
    label: 'Offline',
  },

  online: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['cloud']},
    ]),
    label: 'Online',
  },

  cloud: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['cloud']},
    ]),
    label: 'Cloud',
  },

  api: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['api']},
    ]),
    label: 'API',
  },

  // ============================================================
  // PERMISSIONS
  // ============================================================

  admin: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['admin-panel-settings']},
    ]),
    label: 'Administrator',
  },

  root: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['security']},
    ]),
    label: 'Root',
  },

  // ============================================================
  // OTHER
  // ============================================================

  social: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['share']},
    ]),
    label: 'Social Media',
  },

  recommended: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['star']},
    ]),
    label: 'Recommended',
  },

  official: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['verified']},
    ]),
    label: 'Official',
  },

  'third-party': {
    icon: getIcon([
      {set: materialSymbolSet, names: ['extension']},
    ]),
    label: 'Third-party',
  },

  warning: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['warning']},
    ]),
    label: 'Warning',
  },

  experimental: {
    icon: getIcon([
      {set: materialSymbolSet, names: ['science']},
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

