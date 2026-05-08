---
title: "ExpressLRS українською для RC та FPV"
sidebar_label: "ExpressLRS українською"
description: "Український гайд ExpressLRS: старт, прошивка TX/RX, binding phrase, WebUI, передпольотна перевірка, troubleshooting і вибір ELRS hardware."
sidebar_position: 1
slug: /rc/elrs
---

Цей розділ зібраний навколо практичних сценаріїв ExpressLRS для RC/FPV: прошивка TX-модуля і приймача, Binding Phrase, WebUI, передпольотна перевірка, troubleshooting і вибір hardware. Для пульта RadioMaster TX16S корисно читати його разом з [EdgeTX українською](/docs/rc/edgetx-tx16s/) та [RadioMaster TX16S](/docs/rc/tx16s).

| Задача | Розділ |
| --- | --- |
| Встановити Configurator | [ExpressLRS Configurator](quick-start/installing-configurator.md) |
| Зрозуміти firmware options | [Firmware options](quick-start/firmware-options.md) |
| Bind TX-модуль і приймач | [Binding](quick-start/binding.md) |
| Налаштувати через WiFi | [WebUI](quick-start/webui.md) |
| Перевірити перед польотом | [Перед першим польотом](quick-start/pre-1stflight.md) |
| Діагностувати проблеми | [Troubleshooting](quick-start/troubleshooting.md) |
| Вибрати приймач або TX-модуль | [Вибір hardware](hardware/hardware-selection.md) |

:::warning[Будьте поінформовані]
Команда ExpressLRS тісно співпрацює з виробниками для перевірки та тестування обладнання. Лише після тестування додається конкретний target в ExpressLRS Configurator.

Якщо обладнання не знайдено в ExpressLRS Configurator, це означає, що воно не пройшло вимоги, або виробник вирішив не співпрацювати. У цьому випадку для отримання технічної підтримки слід звертатися до виробника.

Generic targets призначені для передсерійного або DIY обладнання. Готове обладнання (Off-the-shelf) повинно використовувати апаратно-специфічні targets.

TL;DR: перевіряйте Configurator перед покупкою та підтримуйте виробників, які підтримують open source та проєкт ExpressLRS.
:::

## Що є в цьому розділі

Це не повна копія офіційної документації ExpressLRS. Тут перекладені й адаптовані базові сторінки, які найчастіше потрібні для старту: встановлення Configurator, firmware options, binding, WebUI, перевірка перед першим польотом, troubleshooting, вибір hardware, PWM receivers, Dynamic Power і Model Match.

Якщо потрібна інструкція для конкретного TX-модуля або приймача, наприклад RadioMaster Ranger, BetaFPV, Happymodel, Matek або конкретний flash method, дивіться повну офіційну документацію [ExpressLRS Docs](https://www.expresslrs.org/).

## Ласкаво просимо до посібника зі швидкого старту

### Передумови

Ви повинні впевнено орієнтуватися в прошивці вашого пульта (OpenTX/EdgeTX) та налаштовувати моделі, оскільки посібник на цьому сайті в основному охоплює налаштування пульта для можливості використання ExpressLRS.

Так само ви повинні впевнено працювати з прошивкою вашого польотного контролера (Betaflight, INAV тощо), оскільки посібник охоплює лише налаштування вашого приймача ExpressLRS для роботи з прошивкою польотного контролера.

### Що робити спочатку?

Отже, ви отримали своє обладнання ExpressLRS: новий пульт із внутрішнім модулем ExpressLRS або зовнішній TX Module ExpressLRS; а також набір приймачів ExpressLRS у комплекті або Bind-and-Fly дрон із вже підключеним приймачем. З чого почати?

Ось наша рекомендація:

#### Сторона пульта (Transmitter)
1. [Налаштуйте свій пульт](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/transmitters/tx-prep.md)
2. [Перевірте версію прошивки TX](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/transmitters/firmware-version.md)
3. [Оновіть TX Module](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/transmitters/updating.md)

#### Сторона приймача (Receiver)
1. [Підключіть приймач](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/receivers/wiring-up.md)
2. [Налаштуйте польотний контролер](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/receivers/configuring-fc.md)
3. [Перевірте версію прошивки приймача](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/receivers/firmware-version.md)
4. [Оновіть прошивку приймача](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/receivers/updating.md)

Після виконання обох цих етапів ви можете переходити до наступного:

- [Привʼязати (Bind)](quick-start/binding.md)
- Виконати [Bench Test](quick-start/pre-1stflight.md#bench-test)
- Інші [Налаштування пульта та польотного контролера](quick-start/pre-1stflight.md)
- Літати!

---

Джерело: [ExpressLRS Docs](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/getting-started.md), ліцензія [GPLv3](https://github.com/ExpressLRS/Docs/blob/master/LICENSE). Український переклад підготовлений для dead.md.
