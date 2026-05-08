---
title: "ExpressLRS WebUI: налаштування через WiFi"
sidebar_label: "WebUI"
description: "ExpressLRS WebUI для TX-модулів і приймачів: WiFi mode, оновлення firmware, binding phrase, model match та мережеві параметри."
sidebar_position: 5
slug: /rc/elrs/quick-start/webui
---
ExpressLRS WebUI відкривається через WiFi-режим приймача або TX-модуля. Через нього можна оновити firmware, змінити Binding Phrase, перевірити UID, налаштувати WiFi, Model Match, PWM/serial-виходи та runtime options.

## Як відкрити WebUI приймача

### Auto WiFi On

1. Вимкніть пульт із TX-модулем.
2. Перезавантажте приймач по живленню. Світлодіод має повільно блимати.

![RX Waiting](../img/ledseq_disconnected_50_50.gif)

:::warning[Світлодіод приймача не блимає]
Якщо світлодіод світиться постійно, приймач може бути в bootloader mode або soft-bricked після невдалого оновлення. Спробуйте інший UART або виконайте процедуру відновлення з офіційної документації ExpressLRS.
:::

3. Зачекайте приблизно 60 секунд, поки приймач перейде у WiFi mode.

![RX WiFi](../img/ledseq_wifi_update_2_3.gif)

_Приймач на ESP8285 з одноколірним світлодіодом_

![LEDRGB_WIFI_UPDATE](../img/ledseqrgb_wifi_update.gif)

_Приймач на ESP32 з RGB-світлодіодом_

### Через Lua Script

1. Переконайтеся, що приймач і TX-модуль bound/synced: RSSI видно на головному екрані пульта, а світлодіод приймача світиться постійно.

![RX Bound](../img/led_on.gif)

2. Натисніть **SYS** на пульті. На старіших пультах або моделях з однією кнопкою Menu може знадобитися довге натискання кнопки меню.
3. У меню Tools відкрийте Lua Script `ExpressLRS`.
4. Якщо скрипт зависає на `Loading...`, перевірте підготовку пульта для ExpressLRS.
5. Виберіть `Wifi Connectivity`, потім `Enable RX WiFi`.
6. Коли з'явиться `WiFi Running`, приймач перейшов у WiFi mode.

:::info[Примітка]
Після переходу приймача у WiFi mode він від'єднається від TX-модуля. Якщо на SD-карті пульта встановлено sound pack, пульт може озвучити `Telemetry Lost`.
:::

### Через кнопку Boot

Якщо приймач має кнопку boot, утримуйте її приблизно 5 секунд, доки світлодіод не почне швидко блимати.

![betafpv SuperD](../img/betafpvsuperd.png)

_Приклад приймача з кнопкою Boot_

## Підключення до WebUI приймача

1. Підключіться до точки доступу `ExpressLRS RX`.

![WiFi Hotspot](../img/wifihotspot.png)

2. Пароль за замовчуванням: `expresslrs`.
3. Відкрийте `http://10.0.0.1/`, якщо підключені напряму до точки доступу приймача.
4. Відкрийте `http://elrs_rx.local`, якщо приймач уже підключився до домашньої WiFi-мережі, яку ви записали під час прошивки.

:::note
Адреса `10.0.0.1` часто використовується роутерами. Якщо замість ExpressLRS WebUI відкривається сторінка роутера, тимчасово відключіть інші мережеві підключення або спробуйте телефон/планшет.
:::

:::tip[Як знайти IP-адресу в домашній мережі]
Якщо `elrs_rx.local` не відкривається, перегляньте DHCP-список роутера або виконайте `arp -a` на комп'ютері та знайдіть пристрій `elrs`.
:::

## Як відкрити WebUI TX-модуля

### Через ExpressLRS Lua Script

1. Натисніть **SYS** на пульті та відкрийте меню Tools.
2. Виберіть Lua Script `ExpressLRS`.
3. Відкрийте `Wifi Connectivity`.
4. Виберіть `Enable WiFi`.
5. Коли з'явиться `WiFi Running`, TX-модуль перейшов у WiFi mode.

Якщо Lua Script показує Syntax Error на старому пульті або старій версії EdgeTX/OpenTX, модуль усе одно може вже бути в WiFi mode.

### Зовнішній TX-модуль без пульта

Подайте живлення на зовнішній TX-модуль через USB або зовнішнє джерело живлення. Приблизно через 60 секунд RGB-світлодіод має перейти в зелений breathing-pattern, а модулі з OLED можуть показати повідомлення про WiFi mode.

## Підключення до WebUI TX-модуля

1. Підключіться до точки доступу `ExpressLRS TX`.

![WiFi Hotspot](../img/wifihotspottx.png)

2. Пароль за замовчуванням: `expresslrs`.
3. Відкрийте `http://10.0.0.1/`, якщо підключені напряму до точки доступу TX-модуля.
4. Відкрийте `http://elrs_tx.local`, якщо модуль підключився до домашньої WiFi-мережі.

:::tip[Як знайти IP-адресу в домашній мережі]
Якщо `elrs_tx.local` не відкривається, знайдіть пристрій `elrs` у DHCP-списку роутера або через `arp -a`.
:::

## ExpressLRS 4.0 WebUI

У ExpressLRS 4.0 WebUI отримав вертикальне меню і більше сторінок, включно з Hardware Layout.

### Information

Ця вкладка показує назву hardware, версію firmware, GitHub commit hash, radio chip, Regulatory Domain, Binding UID та runtime options, які відрізняються від дефолтних або прошитих значень.

![Information Tab](../img/information.png)

### Binding

Тут можна оновити Binding Phrase або UID. Пристрої з однаковою Binding Phrase/UID вважаються bound і мають з'єднуватися після увімкнення.

![RX Binding Tab](../img/bindingrx.png)

_Binding у WebUI приймача_

![TX Binding Tab](../img/bindingtx.png)

_Binding у WebUI TX-модуля_

### Options

Runtime Options показують налаштування, задані під час прошивки. Зміни на цій вкладці замінюють прошиті значення.

![RX Options Tab](../img/optionsrx.png)

_Options у WebUI приймача_

![TX Options Tab](../img/optionstx.png)

_Options у WebUI TX-модуля_

### Connections і Serial

Connections дозволяє змінювати параметри PWM output pins або перепризначати їх на іншу функцію. Serial дозволяє змінити receiver protocol і baudrate для UART-приймача або PWM-приймача з пінами для serial output.

![Connections Tab](../img/connections.png)

![Serial Tab](../img/serial.png)

### Buttons

Buttons дозволяє змінити поведінку mode-кнопок на окремих зовнішніх TX-модулях і налаштувати LED-колір для кнопок, якщо модуль це підтримує.

![Buttons Tab](../img/buttons.png)

### Import/Export

Import/Export дозволяє експортувати або імпортувати per-model конфігурацію TX-модуля. Для цього також корисний [Model Match](../software/model-config-match.md).

![Import/Export Tab](../img/import-export.png)

### WiFi

WiFi вкладка змінює підключення пристрою до мережі та поведінку в WiFi mode.

![WiFi Tab](../img/wifi.png)

### Update

Update використовується для завантаження firmware-файлу, який підготував ExpressLRS Configurator або Web Flasher.

![Update Tab](../img/update.png)

### Hardware Layout

Hardware Layout призначений для досвідчених користувачів. Тут містяться pin assignments, power management instructions і hardware capability definitions.

:::warning[Попередження]
Не редагуйте Hardware Layout, якщо ви не знаєте наслідків. Наприклад, Max Power `2W` не змусить приймач без PA реально працювати на 2W.
:::

![HW Layout Tab](../img/hardware.png)

### Continuous Wave

Continuous Wave переводить RF-чип у режим безперервної передачі на центральній частоті модуля. Це використовують для діагностики frequency shift/deviation.

![Cont. Wave](../img/continuouswave.png)

### LR1121 Firmware

Ця вкладка дозволяє вручну прошити RF-чип Semtech LR1121 на dual-band hardware. ExpressLRS також може робити це автоматично за потреби.

:::warning[Попередження]
Не прошивайте LR1121 без попередньої перевірки сумісності. Неправильний firmware може зробити пристрій непрацездатним до перепрошивки через Serial.
:::

![LR1121 Fw](../img/lr1121fw.png)

## ExpressLRS 3.0 WebUI

### Banner

![Web UI Banner](../img/web-banner.png)

_Банер ExpressLRS WebUI_

### Options

У ExpressLRS 3.0 ця вкладка дозволяє змінювати firmware options без повної перепрошивки, а також імпортувати/експортувати конфігурацію між пристроями.

- `Binding Phrase`: оновлення Binding Phrase із заводського або попередньо прошитого значення.
- `UID`: read-only представлення Binding Phrase у вигляді UID, який фактично зберігається у пристрої.
- `Regulatory Domain`: застосовується до 900MHz hardware.
- `WiFi Auto On Interval`: час до автоматичного запуску WiFi, якщо пристрій не бачить валідного CRSF/sync-сигналу.

:::note
Поле Binding Phrase може виглядати порожнім, бо WebUI не зберігає plain-text фразу. Перевіряйте UID.
:::

![Web UI Banner](../img/web-options-rx.png)

_Options приймача_

![Web UI Banner](../img/web-options-tx.png)

_Options TX-модуля_

### WiFi, Model, Buttons і Update

![Web UI Banner](../img/web-homenetwork.png)

_WiFi налаштування_

![Web UI Banner](../img/web-rxmodel.png)

_Model вкладка приймача_

![Web UI Banner](../img/web-pwmoutput.png)

_PWM output settings_

![Web UI Banner](../img/web-buttonstx.png)

_Buttons TX-модуля_

![Web UI Banner](../img/web-update-rx.png)

_Update приймача_

![Web UI Banner](../img/web-update-tx.png)

_Update TX-модуля_

---

Джерело: [ExpressLRS Docs](https://github.com/ExpressLRS/Docs/blob/master/docs/quick-start/webui.md), ліцензія [GPLv3](https://github.com/ExpressLRS/Docs/blob/master/LICENSE). Український переклад підготовлений для dead.md.
