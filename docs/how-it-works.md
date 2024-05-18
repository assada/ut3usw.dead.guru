---
sidebar_position: 2
---

# Як працює цей сайт і трохи про мережу "dead.guru"

Все починалось з assada.dead.guru який працював на власному "двіжку" з крутим кастомним дизайном. Але мені просто стало лінь його підтримувати і я прийняв рішення переїхати на Docusaurus.

Репозиторій з цим сайтом знаходиться на [GitHub](https://github.com/assada/ut3usw.dead.guru/tree/master). Після пушу в `master` гілку запускається Github Action що збирає сайт і по sftp доставляє артефакт на мій сервер. [![CI](https://github.com/assada/ut3usw.dead.guru/actions/workflows/ci.yml/badge.svg)](https://github.com/assada/ut3usw.dead.guru/actions/workflows/ci.yml)

Сервер працює на **Debian 12** і використовує docker контейнеризацію для кожного сервісу. [Caddy](https://caddyserver.com/) як реверс проксі для вебу. Інші мої сервіси можна знайти на сайті мережі https://dead.guru, а також в дружній мережі [hypogea.org](https://hypogea.org). Наші мережі об'єднані через [tailscale](https://github.com/tailscale/tailscale). І в середині мережі доступні закриті сервіси.

Долучайтесь до мережі irc.dead.guru#dead або зв'яжіться зі мною через XMPP `figushki@xmpp.dead.guru`.
