import MDXComponents from '@theme-original/MDXComponents';

import BrandLogo from '@site/src/components/BrandLogo';
import PlatformBadges from '@site/src/components/PlatformBadges';
import MediaPreview from '@site/src/components/MediaPreview';

/**
 * Do not replace the built-in `img`, `video`, or `a` mappings here. Docusaurus
 * can render Markdown links through components other than raw HTML anchors;
 * global click interception in Root.tsx handles those consistently.
 */
export default {
  ...MDXComponents,
  BrandLogo,
  PlatformBadges,
  MediaPreview,
};
