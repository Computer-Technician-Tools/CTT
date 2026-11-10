import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './meta-preview.module.css';

type MetaData = {
  siteUrl: string; pagePath: string; title: string; description: string; siteName: string;
  image: string; imageAlt: string; type: string; locale: string; author: string;
  twitterCard: string; twitterSite: string; themeColor: string; robots: string;
};

const defaults: MetaData = {
  siteUrl: 'https://ctt.mrcyo.com', pagePath: '/',
  title: 'Computer Technician Tools (CTT) — IT Utilities & Guides',
  description: 'Discover Computer Technician Tools (CTT), a curated collection of software, utilities, troubleshooting resources, and technical guides for computer technicians and IT enthusiasts.',
  siteName: 'Computer Technician Tools', image: 'https://ctt.mrcyo.com/img/social/ctt-og.png',
  imageAlt: 'Computer Technician Tools — software, utilities, and IT guides', type: 'website', locale: 'en_US',
  author: 'Computer Technician Tools', twitterCard: 'summary_large_image', twitterSite: '',
  themeColor: '#17131f', robots: 'index, follow, max-image-preview:large',
};

function absoluteUrl(base: string, path: string) {
  try { return new URL(path || '/', base).href; } catch { return path; }
}
function esc(value: string) { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export default function MetaPreviewPage(): React.ReactElement {
  const [data, setData] = useState<MetaData>(defaults);
  const [platform, setPlatform] = useState('discord');
  const [copied, setCopied] = useState(false);
  const update = (key: keyof MetaData, value: string) => setData(old => ({...old, [key]: value}));
  const pageUrl = useMemo(() => absoluteUrl(data.siteUrl, data.pagePath), [data.siteUrl, data.pagePath]);
  const imageUrl = useMemo(() => absoluteUrl(data.siteUrl, data.image), [data.siteUrl, data.image]);
  const meta = useMemo(() => {
    const rows = [
      `<title>${esc(data.title)}</title>`,
      `<meta name="description" content="${esc(data.description)}">`,
      `<meta name="author" content="${esc(data.author)}">`,
      `<meta name="robots" content="${esc(data.robots)}">`,
      `<meta name="theme-color" content="${esc(data.themeColor)}">`,
      `<link rel="canonical" href="${esc(pageUrl)}">`,
      `<meta property="og:type" content="${esc(data.type)}">`,
      `<meta property="og:site_name" content="${esc(data.siteName)}">`,
      `<meta property="og:title" content="${esc(data.title)}">`,
      `<meta property="og:description" content="${esc(data.description)}">`,
      `<meta property="og:url" content="${esc(pageUrl)}">`,
      `<meta property="og:image" content="${esc(imageUrl)}">`,
      `<meta property="og:image:alt" content="${esc(data.imageAlt)}">`,
      `<meta property="og:locale" content="${esc(data.locale)}">`,
      `<meta name="twitter:card" content="${esc(data.twitterCard)}">`,
      `<meta name="twitter:title" content="${esc(data.title)}">`,
      `<meta name="twitter:description" content="${esc(data.description)}">`,
      `<meta name="twitter:image" content="${esc(imageUrl)}">`,
      `<meta name="twitter:image:alt" content="${esc(data.imageAlt)}">`,
      ...(data.twitterSite.trim() ? [`<meta name="twitter:site" content="${esc(data.twitterSite)}">`] : []),
    ];
    return rows.join('\n');
  }, [data, pageUrl, imageUrl]);
  async function copy() {
    try { await navigator.clipboard.writeText(meta); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setCopied(false); }
  }
  const field = (label: string, key: keyof MetaData, placeholder?: string, wide = false) => (
    <label className={`${styles.field} ${wide ? styles.wide : ''}`} key={key}>
      <span>{label}</span>
      <input value={data[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder || label} />
    </label>
  );

  return <Layout title="Meta Property Previewer" description="Preview Open Graph, X Cards, and social sharing metadata before publishing a page.">
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>CTT WEB TOOLS</div>
        <h1>Meta Property Previewer</h1>
        <p>Build and preview social metadata for Open Graph, X, Discord, Facebook, LinkedIn, Telegram, WhatsApp, and more. Everything runs locally in your browser; this tool does not fetch or publish your URL.</p>
      </header>
      <div className={styles.layout}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2>Page metadata</h2><button type="button" className={styles.reset} onClick={() => setData(defaults)}>Reset defaults</button></div>
          <div className={styles.fields}>
            {field('Website origin', 'siteUrl', 'https://example.com')}
            {field('Page path', 'pagePath', '/docs/example')}
            {field('Page title', 'title', 'Title shown in the preview', true)}
            <label className={`${styles.field} ${styles.wide}`}><span>Description</span><textarea rows={4} value={data.description} onChange={e => update('description', e.target.value)} /></label>
            {field('Site / brand name', 'siteName')}
            {field('Author', 'author')}
            {field('Social image URL', 'image', 'https://example.com/social.png', true)}
            {field('Image alternative text', 'imageAlt', 'Describe the social preview image', true)}
            <label className={styles.field}><span>Open Graph type</span><select value={data.type} onChange={e => update('type', e.target.value)}><option value="website">website</option><option value="article">article</option><option value="profile">profile</option></select></label>
            <label className={styles.field}><span>Locale</span><input value={data.locale} onChange={e => update('locale', e.target.value)} /></label>
            <label className={styles.field}><span>X card style</span><select value={data.twitterCard} onChange={e => update('twitterCard', e.target.value)}><option value="summary_large_image">Large image</option><option value="summary">Small summary</option></select></label>
            {field('X account (optional)', 'twitterSite', '@youraccount')}
            {field('Theme color', 'themeColor', '#17131f')}
            {field('Robots directive', 'robots', 'index, follow')}
          </div>
          <p className={styles.note}>Use absolute HTTPS URLs for the canonical page and social image. The preview is an approximation; each platform may crop, truncate, cache, or ignore metadata differently.</p>
        </section>
        <section className={styles.previewColumn}>
          <div className={styles.panel}>
            <div className={styles.panelHead}><h2>Live preview</h2></div>
            <div className={styles.platforms} role="group" aria-label="Preview platform">
              {['discord', 'facebook', 'linkedin', 'telegram', 'x'].map(p => <button type="button" key={p} className={platform === p ? styles.activePlatform : ''} onClick={() => setPlatform(p)}>{p === 'x' ? 'X' : p[0].toUpperCase() + p.slice(1)}</button>)}
            </div>
            <div className={`${styles.card} ${styles[platform]}`}>
              {data.image.trim() ? <div className={styles.imageWrap}><img src={imageUrl} alt={data.imageAlt || ''} onError={e => { e.currentTarget.style.display = 'none'; }} onLoad={e => { e.currentTarget.style.display = 'block'; }} /></div> : <div className={styles.imageMissing}>Add a social image URL to preview it</div>}
              <div className={styles.cardText}>
                <div className={styles.domain}>{(() => { try { return new URL(pageUrl).hostname.toUpperCase(); } catch { return 'YOUR-DOMAIN'; } })()}</div>
                <h3>{data.title || 'Your page title'}</h3>
                <p>{data.description || 'Your page description will appear here.'}</p>
                {platform === 'discord' && <div className={styles.discordBrand}>{data.siteName || 'Website'}</div>}
              </div>
            </div>
            <div className={styles.previewMeta}><span>Canonical URL</span><code>{pageUrl}</code></div>
            <div className={styles.previewMeta}><span>Image URL</span><code>{imageUrl}</code></div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHead}><h2>Generated metadata</h2><button type="button" className={styles.copy} onClick={copy}>{copied ? 'Copied!' : 'Copy HTML'}</button></div>
            <pre className={styles.code}><code>{meta}</code></pre>
            <p className={styles.note}>This produces HTML tags, not Schema.org JSON-LD or a live crawler audit. The social image URL must be publicly reachable for platforms to display it.</p>
          </div>
        </section>
      </div>
    </main>
  </Layout>;
}
