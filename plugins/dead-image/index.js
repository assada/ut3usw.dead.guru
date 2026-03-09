/**
 * dead-image — unified Docusaurus image plugin.
 *
 * One plugin that handles everything:
 * - Webpack loader (sharp): responsive AVIF/WebP/JPEG + LQIP
 * - Remark plugin: transforms ![alt](./img/file.png) → <DeadImage />
 * - Theme component: <picture> with responsive srcset + built-in medium-zoom
 *
 * No swizzle, no clientModules, no extra remark plugins.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_OPTIONS = {
  sizes: [480, 768, 1200, 2160],
  formats: ['avif', 'webp', 'jpeg'],
  lqip: true,
  lqipSize: 16,
  lqipQuality: 20,
  quality: { jpeg: 75, webp: 75, avif: 50 },
  fileNameTemplate: 'assets/images/[name]-[hash:hex:5]-[width].[format]',
};

export { default as deadImageRemarkPlugin } from './remark-plugin.mjs';

export default function pluginDeadImage(_context, userOptions) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  return {
    name: 'dead-image',

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    configureWebpack() {
      return {
        resolveLoader: {
          alias: {
            'dead-img': `${path.resolve(__dirname, './loader.js')}?${JSON.stringify(options)}`,
          },
        },
      };
    },
  };
}
