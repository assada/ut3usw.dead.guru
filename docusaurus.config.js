// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import remarkGfm from 'remark-gfm'


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'dead.md',
  tagline: 'Персональний журнал ut3usw',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://dead.md',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true, // required
    },
    experimental_faster: {
      ssgWorkerThreads: true,
    },
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'assada', // Usually your GitHub org/user name.
  projectName: 'ut3usw.dead.guru', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  i18n: {
    defaultLocale: 'uk',
    locales: ['uk'],
  },

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 50,
        size: 640,
        max: 4096, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 5, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
  ],
  
  markdown: {
    remarkRehypeOptions: {
      handlers: {
        ...defListHastHandlers,
        ...extendedTableHandlers
      }
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          remarkPlugins: [
            remarkGfm,
            remarkExtendedTable,
            remarkDefinitionList,
          ],
          rehypePlugins: [
            
          ],

          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          
          //sidebarCollapsed: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
              'https://github.com/assada/ut3usw.dead.guru/edit/master/',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        gtag: {
          trackingID: 'G-YT3JZ6ZGEP',
          anonymizeIP: true,
        },
        blog: {
          showReadingTime: true,
          remarkPlugins: [
            remarkGfm,
            remarkExtendedTable,
            remarkDefinitionList,
          ],
          rehypePlugins: [
              
          ],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
              'https://github.com/assada/ut3usw.dead.guru/edit/master/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],



  themeConfig:
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        colorMode: {
          defaultMode: 'dark',
          disableSwitch: false,
          respectPrefersColorScheme: false,
        },
        image: 'img/docusaurus-social-card.png',
        imageZoom: {
          // CSS selector to apply the plugin to, defaults to '.markdown img'
          selector: '.markdown img',
          // Optional medium-zoom options
          // see: https://www.npmjs.com/package/medium-zoom#options
          options: {
            margin: 24,
            background: 'rgba(0,0,0,0.51)',
            scrollOffset: 0,
          },
        },
        docs: {
          sidebar: {
            autoCollapseCategories: false,
            hideable: false,
          },
        },
        navbar: {
          title: 'DEAD.md',
          logo: {
            alt: 'DEAD Логотип',
            src: 'img/logo.svg',
            srcDark: "img/logo-white.svg",
          },
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'tutorialSidebar',
              position: 'left',
              label: 'Нотатки',
            },
            {to: '/blog', label: 'Блог', position: 'left'},
            {to: '/bookmarks', label: 'Закладки', position: 'left'},
            {
              href: 'https://github.com/assada/ut3usw.dead.guru',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          links: [
            {
              title: 'Корисні сервіси',
              items: [
                {
                  label: 'APRS Мапа',
                  href: 'https://aprs.dead.guru',
                },
              ],
            },
            {
              title: 'Контакти',
              items: [
                {
                  label: 'Twitter',
                  href: 'https://twitter.com/speed_shit',
                },
                {
                  label: 'IRC',
                  href: 'https://irc.dead.guru',
                },
                {
                  label: 'Telegram',
                  href: 'https://t.me/figushki',
                },
              ],
            },
            {
              title: 'Більше',
              items: [
                {
                  label: 'Blog',
                  to: '/blog',
                },
                {
                  label: 'GitHub',
                  href: 'https://github.com/assada',
                },
              ],
            },
          ],
          copyright: `© ${new Date().getFullYear()} частина dead.guru.`,
        },
        prism: {
          theme: prismThemes.github,
          darkTheme: prismThemes.dracula,
          additionalLanguages: ['powershell', 'nginx', 'java', 'csharp', 'cpp', 'c', 'ini', 'bash'],
        },
      }),
};

export default config;
