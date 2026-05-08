---
title: "EdgeTX Telemetry: поширені сенсори"
sidebar_label: "Common Telemetry Sensors"
description: "Поширені telemetry sensors в EdgeTX і автоматично створені мінімальні та максимальні значення сенсорів."
sidebar_position: 32
slug: /rc/edgetx-tx16s/model-settings/telemetry/common-telemetry-sensors
---
Наступні сенсори часто використовуються і зазвичай автоматично виявляються EdgeTX:

<table><thead><tr><th width="107">Назва</th><th width="419.3333333333333">Опис</th><th>Джерело даних</th></tr></thead><tbody><tr><td>1RSS</td><td>Потужність отриманого сигналу антени 1 (RSSI)</td><td>Приймач</td></tr><tr><td>2RSS</td><td>Потужність отриманого сигналу антени 2 (RSSI)</td><td>Приймач</td></tr><tr><td>Rqly</td><td>Якість зв'язку приймача (валідні пакети)</td><td>Приймач</td></tr><tr><td>RSNR</td><td>Відношення сигнал/шум приймача</td><td>Приймач</td></tr><tr><td>RFMD</td><td>Частота пакетів приймача</td><td>Приймач</td></tr><tr><td>TPWR</td><td>Потужність передачі передавача</td><td>Передавач</td></tr><tr><td>TRSS</td><td>Потужність сигналу антени передавача</td><td>Передавач</td></tr><tr><td>TQly</td><td>Якість зв'язку передавача (валідні пакети)</td><td>Передавач</td></tr><tr><td>TSNR</td><td>Відношення сигнал/шум передавача</td><td>Передавач</td></tr><tr><td>ANT</td><td>Сенсор лише для зневадження</td><td>Передавач</td></tr><tr><td>GPS</td><td>Координати GPS</td><td>GPS / Польотний контролер</td></tr><tr><td>Alt</td><td>Висота GPS</td><td>GPS / Польотний контролер</td></tr><tr><td>Sats</td><td>Кількість знайдених супутників GPS</td><td>GPS / Польотний контролер</td></tr><tr><td>Hdg</td><td>Магнітна орієнтація (курс)</td><td>GPS / Польотний контролер</td></tr><tr><td>RXBt</td><td>Напруга батареї</td><td>Польотний контролер</td></tr><tr><td>Curr</td><td>Споживання струму</td><td>Польотний контролер</td></tr><tr><td>Capa</td><td>Спожита ємність</td><td>Польотний контролер</td></tr><tr><td>Ptch</td><td>Кут Pitch ПК</td><td>Польотний контролер</td></tr><tr><td>Roll</td><td>Кут Roll ПК</td><td>Польотний контролер</td></tr><tr><td>Yaw</td><td>Кут Yaw ПК</td><td>Польотний контролер</td></tr><tr><td>FM</td><td>Режим польоту</td><td>Польотний контролер</td></tr><tr><td>VSPD</td><td>Вертикальна швидкість</td><td>Польотний контролер з барометром</td></tr></tbody></table>

:::info
Кожен сенсор має два автоматично згенеровані сенсори для їх мінімальних та максимальних значень. Вони мають таку ж назву з додаванням символів мінуса та плюса в кінці. Наприклад: **RXBt +** Це відображає максимальне значення, якого сенсор досяг під час польоту. Використання функції [Reset Telemetry](../../reset-telemetry.md) або Reset Flight скине це значення до 0.
:::

---

Джерело: [EdgeTX User Manual 2.11](https://github.com/EdgeTX/edgetx-user-manual/blob/2.11/color-radios/model-settings/telemetry/common-telemetry-sensors.md), ліцензія [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Український переклад підготовлений для dead.md.
