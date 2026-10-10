import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './styles.module.css';

type MediaType = 'image' | 'video';

export type MediaPreviewItem = {
  src: string;
  type?: MediaType;
  alt?: string;
  title?: string;
  poster?: string;
};

type MediaPreviewProps = {
  items: MediaPreviewItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

function safeMediaUrl(value: string): string | null {
  const url = value.trim();
  if (!url || url.startsWith('//')) return null;
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function getMediaType(item: MediaPreviewItem): MediaType {
  if (item.type) return item.type;
  const path = item.src.split(/[?#]/, 1)[0].toLowerCase();
  return /\.(mp4|webm|ogv|ogg|mov|m4v)$/.test(path) ? 'video' : 'image';
}

export default function MediaPreview({
  items,
  columns = 3,
  className,
}: MediaPreviewProps): React.JSX.Element | null {
  const media = useMemo(
    () => (Array.isArray(items) ? items : []).flatMap((item) => {
      if (!item || typeof item.src !== 'string') return [];
      const src = safeMediaUrl(item.src);
      if (!src) return [];
      const poster = item.poster ? safeMediaUrl(item.poster) ?? undefined : undefined;
      return [{...item, src, poster, type: getMediaType(item)}];
    }),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const activeItem = activeIndex === null ? null : media[activeIndex];

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveIndex((index) => index === null || media.length < 2 ? index : (index - 1 + media.length) % media.length);
  }, [media.length]);
  const showNext = useCallback(() => {
    setActiveIndex((index) => index === null || media.length < 2 ? index : (index + 1) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
      if (event.key === 'Tab') {
        // Keep keyboard focus inside the modal while it is open.
        const dialog = document.querySelector<HTMLElement>(`[data-media-preview-dialog="true"]`);
        if (!dialog) return;
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), video[controls], a[href], [tabindex]:not([tabindex="-1"])'))
          .filter((element) => element.offsetParent !== null);
        if (!focusable.length) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [activeIndex, close, showNext, showPrevious]);

  if (!media.length) return null;

  return (
    <>
      <div className={`${styles.gallery} ${className ?? ''}`} style={{'--media-columns': columns} as React.CSSProperties}>
        {media.map((item, index) => (
          <button
            className={styles.tile}
            key={`${item.src}-${index}`}
            type="button"
            onClick={(event) => {
              // Prevent an enclosing Markdown anchor from navigating away.
              event.preventDefault();
              event.stopPropagation();
              setActiveIndex(index);
            }}
            aria-label={`Preview ${item.title || item.alt || (item.type === 'video' ? 'video' : 'image')}`}
          >
            {item.type === 'video' ? (
              <video className={styles.thumbnail} src={item.src} poster={item.poster} muted playsInline preload="none" aria-label={item.alt || item.title || 'Video preview'} />
            ) : (
              <img className={styles.thumbnail} src={item.src} alt={item.alt || item.title || ''} loading="lazy" decoding="async" />
            )}
            {item.type === 'video' && <span className={styles.playIcon} aria-hidden="true">▶</span>}
            {item.title && <span className={styles.caption}>{item.title}</span>}
          </button>
        ))}
      </div>

      {activeItem && (
        <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.title || 'Media preview'}
            tabIndex={-1}
            data-media-preview-dialog="true"
          >
            <header className={styles.toolbar}>
              <span className={styles.dialogTitle}>{activeItem.title || activeItem.alt || (activeItem.type === 'video' ? 'Video preview' : 'Image preview')}</span>
              <span className={styles.counter}>{activeIndex! + 1} / {media.length}</span>
              <button ref={closeButtonRef} className={styles.control} type="button" onClick={close} aria-label="Close media preview">×</button>
            </header>
            <div className={styles.stage}>
              {activeItem.type === 'video' ? (
                <video className={styles.fullMedia} src={activeItem.src} poster={activeItem.poster} controls autoPlay playsInline preload="metadata" />
              ) : (
                <img className={styles.fullMedia} src={activeItem.src} alt={activeItem.alt || activeItem.title || 'Expanded image'} decoding="async" />
              )}
            </div>
            {media.length > 1 && (
              <nav className={styles.navigation} aria-label="Media navigation">
                <button className={styles.control} type="button" onClick={showPrevious} aria-label="Previous media">← Previous</button>
                <button className={styles.control} type="button" onClick={showNext} aria-label="Next media">Next →</button>
              </nav>
            )}
          </section>
        </div>
      )}
    </>
  );
}


/** Makes ordinary Markdown images open in the CTT media viewer. */
export function MediaPreviewImage(props: React.ImgHTMLAttributes<HTMLImageElement>): React.JSX.Element {
  const src = typeof props.src === 'string' ? props.src : '';
  const alt = typeof props.alt === 'string' ? props.alt : '';
  if (!src) return <img {...props} />;
  return <MediaPreview items={[{src, type: 'image', alt, title: alt || undefined}]} columns={1} />;
}

/** Makes ordinary MDX video elements open in the CTT media viewer. */
export function MediaPreviewVideo(props: React.VideoHTMLAttributes<HTMLVideoElement>): React.JSX.Element {
  const src = typeof props.src === 'string' ? props.src : '';
  const poster = typeof props.poster === 'string' ? props.poster : undefined;
  if (!src) return <video {...props} />;
  return <MediaPreview items={[{src, type: 'video', poster, title: props.title}]} columns={1} />;
}

const MEDIA_FILE_RE = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp|mp4|webm|ogv|ogg|mov|m4v)(?:[?#].*)?$/i;

function findImageSource(node: React.ReactNode): {src: string; alt?: string; title?: string} | null {
  let found: {src: string; alt?: string; title?: string} | null = null;
  React.Children.forEach(node, (child) => {
    if (found || !React.isValidElement(child)) return;
    const props = child.props as Record<string, unknown>;
    if (typeof props.src === 'string' && props.src && (child.type === 'img' || child.type === MediaPreviewImage || props.alt !== undefined)) {
      found = {
        src: props.src,
        alt: typeof props.alt === 'string' ? props.alt : undefined,
        title: typeof props.title === 'string' ? props.title : undefined,
      };
      return;
    }
    if (props.children !== undefined) found = findImageSource(props.children as React.ReactNode);
  });
  return found;
}

/** Intercepts links to media files and linked Markdown images. */
export function MediaPreviewAnchor(props: React.AnchorHTMLAttributes<HTMLAnchorElement>): React.JSX.Element {
  const href = typeof props.href === 'string' ? props.href : '';
  const linkedImage = findImageSource(props.children);
  const mediaHref = href && MEDIA_FILE_RE.test(href) ? href : '';
  const src = mediaHref || linkedImage?.src || '';

  if (src) {
    const type: MediaType = /\.(?:mp4|webm|ogv|ogg|mov|m4v)(?:[?#].*)?$/i.test(src) ? 'video' : 'image';
    const title = (typeof props.title === 'string' ? props.title : undefined) || linkedImage?.title;
    return <MediaPreview items={[{src, type, title, alt: linkedImage?.alt}]} columns={1} />;
  }

  return <a {...props} />;
}
