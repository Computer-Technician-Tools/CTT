import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faNpm,
  faDocker,
  faPython,
  faCodepen,
  faGitAlt,
} from '@fortawesome/free-brands-svg-icons';
import {simpleIcons} from '@site/src/generated/platform-icons';

import styles from './styles.module.css';

const bundledBrandIcons = simpleIcons.icons as Record<string, {body: string} | undefined>;

interface SourceBadgeProps {
  url: string;

  // Source / repository platforms
  github?: string;
  gitlab?: string;
  bitbucket?: string;
  codeberg?: string;
  gitea?: string;
  forgejo?: string;
  sourceforge?: string;
  sourcehut?: string;
  launchpad?: string;
  savannah?: string;
  kde?: string;

  // Package / development platforms
  npm?: string;
  pypi?: string;
  dockerhub?: string;
  huggingface?: string;
  codepen?: string;
  git?: string;

  // Distribution / software stores
  steam?: string;
  epicgames?: string;
  gog?: string;
  itch?: string;
  microsoftstore?: string;
  googleplay?: string;
  appstore?: string;
  flathub?: string;
  snapcraft?: string;
  fdroid?: string;

  // Explicit website icon override
  icon?: string;
}

type SourceLink = {
  url: string;
  type: SourceType;
};

type SourceType =
  | 'url'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'codeberg'
  | 'gitea'
  | 'forgejo'
  | 'sourceforge'
  | 'sourcehut'
  | 'launchpad'
  | 'savannah'
  | 'kde'
  | 'npm'
  | 'pypi'
  | 'dockerhub'
  | 'huggingface'
  | 'codepen'
  | 'git'
  | 'steam'
  | 'epicgames'
  | 'gog'
  | 'itch'
  | 'microsoftstore'
  | 'googleplay'
  | 'appstore'
  | 'flathub'
  | 'snapcraft'
  | 'fdroid';

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function isSafeExternalUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function getIconSources(
  url: string,
  icon?: string,
): string[] {
  const domain = getDomain(url);
  const sources: string[] = [];

  if (icon && isSafeImageSource(icon)) {
    sources.push(icon);
  }

  if (domain) {
    sources.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        domain,
      )}&sz=64`,
    );
  }
  return sources;
}

function isSafeImageSource(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Keep third-party icons remote-only. They are fetched on demand while online
 * and omitted from offline documentation.
 */
function IconPlaceholder({offline = false}: {offline?: boolean}) {
  return (
    <span
      className={styles.favicon}
      role="img"
      aria-label={offline ? 'Website icon not saved offline' : 'Website icon unavailable'}
      title={offline
        ? 'Website icon not saved for offline use. Reconnect once to save it on this device.'
        : 'Website icon unavailable; link remains available.'}
    >
      <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M2.75 12h18.5M12 2.75c2.6 2.6 3.9 5.6 3.9 9.25s-1.3 6.65-3.9 9.25c-2.6-2.6-3.9-5.6-3.9-9.25s1.3-6.65 3.9-9.25z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    </span>
  );
}

/**
 * Tries each candidate image in order. When every candidate fails while offline,
 * a placeholder is shown instead, and the icon is retried when the connection
 * returns. When online, nothing is shown for an icon that is unavailable.
 */
function CachedIcon({
  sources,
  title,
}: {
  sources: string[];
  title?: string;
}) {
  const candidates = sources;
  const [index, setIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const retry = () => {
      setOnline(true);
      setIndex(0);
      setExhausted(false);
    };
    update();
    window.addEventListener('online', retry);
    window.addEventListener('offline', update);
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CTT_OFFLINE') setOnline(false);
    };
    navigator.serviceWorker?.addEventListener('message', onWorkerMessage);
    return () => {
      window.removeEventListener('online', retry);
      window.removeEventListener('offline', update);
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage);
    };
  }, []);

  // Third-party favicons are optional: keep offline pages focused on readable text.
  if (!online) return null;

  if (candidates.length === 0) {
    return null;
  }

  if (exhausted || index >= candidates.length) {
    return <IconPlaceholder />;
  }

  return (
    <img
      src={candidates[index]}
      alt=""
      className={styles.favicon}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      title={title}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex(index + 1);
        } else {
          setExhausted(true);
        }
      }}
    />
  );
}

function WebsiteIcon({
  url,
  icon,
}: {
  url: string;
  icon?: string;
}) {
  return <CachedIcon sources={getIconSources(url, icon)} />;
}

function SimpleIcon({
  name,
  alt,
}: {
  name: string;
  alt: string;
}) {
  const icon = bundledBrandIcons[name];
  if (!icon) return <CachedIcon sources={[`https://cdn.simpleicons.org/${name}`]} title={alt} />;
  return (
    <svg className={styles.brandIcon} role="img" aria-label={alt} viewBox="0 0 24 24" focusable="false">
      <title>{alt}</title>
      <g dangerouslySetInnerHTML={{__html: icon.body}} />
    </svg>
  );
}

function SourcePlatformIcon({
  type,
  url,
  icon,
}: {
  type: SourceType;
  url: string;
  icon?: string;
}) {
  switch (type) {
    case 'url':
      return (
        <WebsiteIcon
          url={url}
          icon={icon}
        />
      );

    // Distribution / software stores use the official
    // favicon from the supplied store URL.
    case 'steam':
    case 'epicgames':
    case 'gog':
    case 'itch':
    case 'microsoftstore':
    case 'googleplay':
    case 'appstore':
    case 'flathub':
    case 'snapcraft':
    case 'fdroid':
      return (
        <WebsiteIcon
          url={url}
        />
      );

    case 'github':
      return <SimpleIcon name="github" alt="GitHub" />;

    case 'gitlab':
      return <SimpleIcon name="gitlab" alt="GitLab" />;

    case 'bitbucket':
      return <SimpleIcon name="bitbucket" alt="Bitbucket" />;

    case 'npm':
      return (
        <FontAwesomeIcon
          icon={faNpm}
          title="npm"
        />
      );

    case 'dockerhub':
      return (
        <FontAwesomeIcon
          icon={faDocker}
          title="Docker Hub"
        />
      );

    case 'pypi':
      return (
        <FontAwesomeIcon
          icon={faPython}
          title="PyPI"
        />
      );

    case 'codepen':
      return (
        <FontAwesomeIcon
          icon={faCodepen}
          title="CodePen"
        />
      );

    case 'git':
      return (
        <FontAwesomeIcon
          icon={faGitAlt}
          title="Git"
        />
      );

    case 'codeberg':
      return (
        <SimpleIcon
          name="codeberg"
          alt="Codeberg"
        />
      );

    case 'gitea':
      return (
        <SimpleIcon
          name="gitea"
          alt="Gitea"
        />
      );

    case 'forgejo':
      return (
        <SimpleIcon
          name="forgejo"
          alt="Forgejo"
        />
      );

    case 'sourceforge':
      return (
        <SimpleIcon
          name="sourceforge"
          alt="SourceForge"
        />
      );

    case 'sourcehut':
      return (
        <SimpleIcon
          name="sourcehut"
          alt="SourceHut"
        />
      );

    case 'launchpad':
      return (
        <SimpleIcon
          name="launchpad"
          alt="Launchpad"
        />
      );

    case 'savannah':
      return (
        <SimpleIcon
          name="savannah"
          alt="Savannah"
        />
      );

    case 'kde':
      return (
        <SimpleIcon
          name="kde"
          alt="KDE Invent"
        />
      );

    case 'huggingface':
      return (
        <SimpleIcon
          name="huggingface"
          alt="Hugging Face"
        />
      );

    default:
      return null;
  }
}

function getSourceLinks(
  props: SourceBadgeProps,
): SourceLink[] {
  /*
   * Preserve the exact prop order from the MDX/JSX call.
   * This lets authors control the visual order simply by changing
   * the order of the props, without needing a separate `order` prop.
   */
  const sourceTypes: Record<string, SourceType> = {
    url: 'url',
    github: 'github',
    gitlab: 'gitlab',
    bitbucket: 'bitbucket',
    codeberg: 'codeberg',
    gitea: 'gitea',
    forgejo: 'forgejo',
    sourceforge: 'sourceforge',
    sourcehut: 'sourcehut',
    launchpad: 'launchpad',
    savannah: 'savannah',
    kde: 'kde',
    npm: 'npm',
    pypi: 'pypi',
    dockerhub: 'dockerhub',
    huggingface: 'huggingface',
    codepen: 'codepen',
    git: 'git',
    steam: 'steam',
    epicgames: 'epicgames',
    gog: 'gog',
    itch: 'itch',
    microsoftstore: 'microsoftstore',
    googleplay: 'googleplay',
    appstore: 'appstore',
    flathub: 'flathub',
    snapcraft: 'snapcraft',
    fdroid: 'fdroid',
  };

  return Object.entries(props)
    .filter(
      ([key, value]) =>
        key !== 'icon' &&
        Boolean(value) &&
        isSafeExternalUrl(String(value)) &&
        Object.prototype.hasOwnProperty.call(sourceTypes, key),
    )
    .map(([key, value]) => {
      const url = String(value);
      // A plain `url=` prop is a generic link. Detect known hosts so GitHub,
      // Play Store, F-Droid, etc. get their own icon and tooltip.
      const type = key === 'url' ? inferSourceType(url) : sourceTypes[key];
      return {url, type};
    });
}

/** Maps a link's hostname to a known source type. Unknown hosts stay 'url'. */
const HOST_TYPES: Array<[RegExp, SourceType]> = [
  [/(^|\.)github\.com$/, 'github'],
  [/(^|\.)gitlab\.com$/, 'gitlab'],
  [/(^|\.)bitbucket\.org$/, 'bitbucket'],
  [/(^|\.)codeberg\.org$/, 'codeberg'],
  [/(^|\.)sourceforge\.net$/, 'sourceforge'],
  [/(^|\.)sr\.ht$/, 'sourcehut'],
  [/(^|\.)launchpad\.net$/, 'launchpad'],
  [/(^|\.)savannah\.gnu\.org$/, 'savannah'],
  [/(^|\.)invent\.kde\.org$/, 'kde'],
  [/(^|\.)npmjs\.com$/, 'npm'],
  [/(^|\.)pypi\.org$/, 'pypi'],
  [/(^|\.)hub\.docker\.com$/, 'dockerhub'],
  [/(^|\.)huggingface\.co$/, 'huggingface'],
  [/(^|\.)codepen\.io$/, 'codepen'],
  [/(^|\.)store\.steampowered\.com$/, 'steam'],
  [/(^|\.)epicgames\.com$/, 'epicgames'],
  [/(^|\.)gog\.com$/, 'gog'],
  [/(^|\.)itch\.io$/, 'itch'],
  [/(^|\.)apps\.microsoft\.com$/, 'microsoftstore'],
  [/(^|\.)play\.google\.com$/, 'googleplay'],
  [/(^|\.)apps\.apple\.com$/, 'appstore'],
  [/(^|\.)flathub\.org$/, 'flathub'],
  [/(^|\.)snapcraft\.io$/, 'snapcraft'],
  [/(^|\.)f-droid\.org$/, 'fdroid'],
];

function inferSourceType(url: string): SourceType {
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'url';
  }
  const match = HOST_TYPES.find(([pattern]) => pattern.test(host));
  return match ? match[1] : 'url';
}

function getSourceTypeLabel(
  type: SourceType,
): string {
  switch (type) {
    case 'url':
      return 'Official website';

    case 'github':
      return 'GitHub';

    case 'gitlab':
      return 'GitLab';

    case 'bitbucket':
      return 'Bitbucket';

    case 'codeberg':
      return 'Codeberg';

    case 'gitea':
      return 'Gitea';

    case 'forgejo':
      return 'Forgejo';

    case 'sourceforge':
      return 'SourceForge';

    case 'sourcehut':
      return 'SourceHut';

    case 'launchpad':
      return 'Launchpad';

    case 'savannah':
      return 'Savannah';

    case 'kde':
      return 'KDE Invent';

    case 'npm':
      return 'npm';

    case 'pypi':
      return 'PyPI';

    case 'dockerhub':
      return 'Docker Hub';

    case 'huggingface':
      return 'Hugging Face';

    case 'codepen':
      return 'CodePen';

    case 'git':
      return 'Git';

    case 'steam':
      return 'Steam';

    case 'epicgames':
      return 'Epic Games';

    case 'gog':
      return 'GOG';

    case 'itch':
      return 'itch.io';

    case 'microsoftstore':
      return 'Microsoft Store';

    case 'googleplay':
      return 'Google Play';

    case 'appstore':
      return 'App Store';

    case 'flathub':
      return 'Flathub';

    case 'snapcraft':
      return 'Snapcraft';

    case 'fdroid':
      return 'F-Droid';

    default:
      return type;
  }
}

export default function SourceBadge(props: SourceBadgeProps) {
  const sources = getSourceLinks(props);

  return (
    <span
      className={styles.sourceGroup}
      data-ctt-icons=""
    >
      {sources.map((source, index) => {
        const label = getSourceTypeLabel(source.type);

        return (
          <a
            key={`${source.type}-${source.url}-${index}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceBadge}
            title={source.type === 'url' ? 'Official website' : `View on ${label}`}
            aria-label={source.type === 'url' ? 'Open official website' : `View on ${label}`}
          >
            <span>
              <SourcePlatformIcon
                type={source.type}
                url={source.url}
                icon={source.type === 'url' ? props.icon : undefined}
              />
            </span>
          </a>
        );
      })}
    </span>
  );
}
