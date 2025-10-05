// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'dead.md',
  tagline: 'Персональні нотатки радіогубителя',
  favicon: 'img/favicon.svg',

  stylesheets: ['./src/css/docusaurus-cyberpunk-theme.css'],

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

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'uk',
    locales: ['uk', 'en'],
  },

  plugins: [
    'plugin-image-zoom'
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
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
          background: 'rgba(0,0,0,0.71)',
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
