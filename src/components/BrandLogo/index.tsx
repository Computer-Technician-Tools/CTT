import {simpleIcons} from '@site/src/generated/platform-icons';

type IconData = { body: string; width?: number; height?: number; left?: number; top?: number };
type IconSet = { width?: number; height?: number; icons?: Record<string, IconData> };
type BrandLogoProps = { name: string; alt?: string; size?: number };

const simpleIconSet = simpleIcons as unknown as IconSet;

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[\\s_]+/g, '-').replace(/-/g, '');
}

export default function BrandLogo({ name, alt, size = 48 }: BrandLogoProps) {
  const normalized = normalizeName(name);
  const icon = simpleIconSet.icons?.[normalized] ??
    simpleIconSet.icons?.[name.trim().toLowerCase().replace(/[\\s_]+/g, '-')];

  if (!icon) {
    // Deliberately avoid a remote CDN fallback so the component remains offline-capable.
    return (
      <svg role="img" aria-label={alt ?? `${name} logo unavailable`} width={size} height={size}
        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>{alt ?? `${name} logo unavailable`}</title>
        <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
      </svg>
    );
  }

  const width = icon.width ?? simpleIconSet.width ?? 24;
  const height = icon.height ?? simpleIconSet.height ?? 24;
  return (
    <svg role="img" aria-label={alt ?? `${name} logo`} width={size} height={size}
      viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{__html: icon.body}} />
  );
}
