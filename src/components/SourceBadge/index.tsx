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

  // Explicit website icon override
  icon?: string;
}

type SourceLink = {
  url: string;
  type: SourceType;
};

type SourceType =
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
  | 'snapcraft';

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
}: {
  type: SourceType;
  url: string;
}) {
  switch (type) {
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
  const sources: Array<{
    url?: string;
    type: SourceType;
  }> = [
    // Source / repository platforms
    {url: props.github, type: 'github'},
    {url: props.gitlab, type: 'gitlab'},
    {url: props.bitbucket, type: 'bitbucket'},
    {url: props.codeberg, type: 'codeberg'},
    {url: props.gitea, type: 'gitea'},
    {url: props.forgejo, type: 'forgejo'},
    {url: props.sourceforge, type: 'sourceforge'},
    {url: props.sourcehut, type: 'sourcehut'},
    {url: props.launchpad, type: 'launchpad'},
    {url: props.savannah, type: 'savannah'},
    {url: props.kde, type: 'kde'},

    // Package / development platforms
    {url: props.npm, type: 'npm'},
    {url: props.pypi, type: 'pypi'},
    {url: props.dockerhub, type: 'dockerhub'},
    {url: props.huggingface, type: 'huggingface'},
    {url: props.codepen, type: 'codepen'},
    {url: props.git, type: 'git'},

    // Distribution / software stores
    {url: props.steam, type: 'steam'},
    {url: props.epicgames, type: 'epicgames'},
    {url: props.gog, type: 'gog'},
    {url: props.itch, type: 'itch'},
    {url: props.microsoftstore, type: 'microsoftstore'},
    {url: props.googleplay, type: 'googleplay'},
    {url: props.appstore, type: 'appstore'},
    {url: props.flathub, type: 'flathub'},
    {url: props.snapcraft, type: 'snapcraft'},
  ];

  return sources
    .filter(
      (source): source is SourceLink =>
        Boolean(source.url),
    )
    .map((source) => ({
      url: source.url,
      type: source.type,
    }));
}

function getSourceTypeLabel(
  type: SourceType,
): string {
  switch (type) {
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

    default:
      return type;
  }
}

export default function SourceBadge({
  url,
  github,
  gitlab,
  bitbucket,
  codeberg,
  gitea,
  forgejo,
  sourceforge,
  sourcehut,
  launchpad,
  savannah,
  kde,
  npm,
  pypi,
  dockerhub,
  huggingface,
  codepen,
  git,

  steam,
  epicgames,
  gog,
  itch,
  microsoftstore,
  googleplay,
  appstore,
  flathub,
  snapcraft,

  icon,
}: SourceBadgeProps) {
  const sources = getSourceLinks({
    url,
    github,
    gitlab,
    bitbucket,
    codeberg,
    gitea,
    forgejo,
    sourceforge,
    sourcehut,
    launchpad,
    savannah,
    kde,
    npm,
    pypi,
    dockerhub,
    huggingface,
    codepen,
    git,

    steam,
    epicgames,
    gog,
    itch,
    microsoftstore,
    googleplay,
    appstore,
    flathub,
    snapcraft,

    icon,
  });

  return (
    <span className={styles.sourceGroup}>
      {/* Official website */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.sourceBadge}
        title="Official website"
        aria-label="Open official website"
      >
        <WebsiteIcon
          url={url}
          icon={icon}
        />
      </a>

      {/* Source / development / distribution platforms */}
      {sources.map((source) => {
        const label = getSourceTypeLabel(
          source.type,
        );

        return (
          <a
            key={`${source.type}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceBadge}
            title={`View on ${label}`}
            aria-label={`View on ${label}`}
          >
            <SourcePlatformIcon
              type={source.type}
              url={source.url}
            />
          </a>
        );
      })}
    </span>
  );
}