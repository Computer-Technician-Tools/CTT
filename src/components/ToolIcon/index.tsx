import {useEffect, useState} from 'react';
import {externalAssets} from '@site/src/generated/external-assets';

/*
 * Icon by name, for use in docs:
 *   <ToolIcon name="hl-proxmox" />  Dashboard Icons
 *   <ToolIcon name="sh-home-assistant" />  selfh.st icons
 *   <ToolIcon name="mdi-alien" />  Material Design Icons
 *   <ToolIcon name="si-github" />  Simple Icons
 * The local copy saved at build time is used first. Dashboard Icons and selfh.st
 * fall back to jsDelivr when online. Nothing is shown when neither is available.
 */
const JSDELIVR: Record<string, string> = {
  hl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/',
  sh: 'https://cdn.jsdelivr.net/gh/selfhst/icons/svg/',
};

export default function ToolIcon({
  name,
  alt = '',
  size = 24,
}: {
  name: string;
  alt?: string;
  size?: number;
}) {
  const [stage, setStage] = useState(0);
  const [online, setOnline] = useState(true);
  const match = name.match(/^([a-z]+)-(.+)$/);
  const [, prefix = '', slug = ''] = match ?? [];
  const remote = JSDELIVR[prefix] ? `${JSDELIVR[prefix]}${slug}.svg` : undefined;
  const local = externalAssets[remote ?? `iconify:${prefix}-${slug}`];
  const candidates = [local, remote].filter((src): src is string => Boolean(src));

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CTT_OFFLINE') setOnline(false);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, []);

  if (!match || !online) return null;

  if (stage >= candidates.length) {
    return (
      <span
        role="img"
        aria-label={alt || `${name} icon unavailable offline`}
        title="Icon unavailable offline. Reconnect once to cache it."
        style={{display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', opacity: .65}}
      >
        ◌
      </span>
    );
  }

  return (
    <img
      src={candidates[stage]}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setStage(stage + 1)}
    />
  );
}
