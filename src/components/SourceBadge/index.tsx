import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faGitlab,
  faBitbucket,
  faNpm,
  faDocker,
  faPython,
  faCodepen,
  faGitAlt,
} from '@fortawesome/free-brands-svg-icons';

import styles from './styles.module.css';

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

function getIconSources(
  url: string,
  icon?: string,
): string[] {
  const domain = getDomain(url);
  const sources: string[] = [];

  if (icon) {
    sources.push(icon);
  }

  if (domain) {
    sources.push(
      `https://icon.horse/icon/${domain}`,
    );
  }

  if (domain) {
    sources.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        domain,
      )}&sz=128`,
    );
  }

  return sources;
}

function WebsiteIcon({
  url,
  icon,
}: {
  url: string;
  icon?: string;
}) {
  const sources = getIconSources(url, icon);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex >= sources.length) {
    return null;
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt=""
      className={styles.favicon}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      onError={() => {
        setSourceIndex((index) => index + 1);
      }}
    />
  );
}

function SimpleIcon({
  name,
  alt,
}: {
  name: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${name}`}
      alt=""
      className={styles.favicon}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      title={alt}
      onError={() => setFailed(true)}
    />
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
      return (
        <FontAwesomeIcon
          icon={faGithub}
          title="GitHub"
        />
      );

    case 'gitlab':
      return (
        <FontAwesomeIcon
          icon={faGitlab}
          title="GitLab"
        />
      );

    case 'bitbucket':
      return (
        <FontAwesomeIcon
          icon={faBitbucket}
          title="Bitbucket"
        />
      );

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
        Object.prototype.hasOwnProperty.call(sourceTypes, key),
    )
    .map(([key, value]) => ({
      url: String(value),
      type: sourceTypes[key],
    }));
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

  const sourceGroupStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 28px)',
    gridAutoRows: '28px',
    alignItems: 'center',
    justifyItems: 'center',
    justifyContent: 'start',
    alignContent: 'start',
    columnGap: '0.25rem',
    rowGap: '0.25rem',
    width: 'fit-content',
    maxWidth: '100%',
    lineHeight: 0,
    verticalAlign: 'middle',
  };

  const sourceBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
    flex: '0 0 28px',
    margin: 0,
    padding: 0,
    lineHeight: 0,
    verticalAlign: 'middle',
    boxSizing: 'border-box' as const,
  };

  const sourceIconBoxStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    minWidth: 24,
    minHeight: 24,
    flex: '0 0 24px',
    margin: 0,
    padding: 0,
    lineHeight: 0,
    boxSizing: 'border-box' as const,
  };

  return (
    <span
      className={styles.sourceGroup}
      style={sourceGroupStyle}
    >
      {sources.map((source) => {
        const label = getSourceTypeLabel(source.type);

        return (
          <a
            key={`${source.type}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceBadge}
            style={sourceBadgeStyle}
            title={source.type === 'url' ? 'Official website' : `View on ${label}`}
            aria-label={source.type === 'url' ? 'Open official website' : `View on ${label}`}
          >
            <span style={sourceIconBoxStyle}>
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