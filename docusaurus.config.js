// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'UT3USW',
  tagline: 'Персональні нотатки радіогубителя',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://ut3usw.dead.guru',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

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
    locales: ['uk'],
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
          sidebarPath: require.resolve('./sidebars.js'),
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
          trackingID: 'G-BB6G190X63',
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
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
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
      navbar: {
        title: 'UT3USW',
        logo: {
          alt: 'UT3USW Логотип',
          src: 'img/logo.svg',
          srcDark: "img/logo-white.svg",
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Документація',
          },
          {to: '/blog', label: 'Блог', position: 'left'},
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
        copyright: `Щось-там © ${new Date().getFullYear()} UT3USW. Це частина dead.guru.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
