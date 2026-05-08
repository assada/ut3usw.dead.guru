---
title: "EdgeTX Reset Telemetry: скидання телеметрії"
sidebar_label: "Reset Telemetry"
description: "Reset Telemetry в EdgeTX: reset telemetry, reset flight і повторний запуск перевірок для активної моделі."
sidebar_position: 45
slug: /rc/edgetx-tx16s/reset-telemetry
---
![Екран Reset telemetry](img/color_quick-menu_reset-telemetry.png)

**Reset session** - якщо вибрано, ця опція:

* Скидає на нуль усі таймери, що мають налаштування збереження **Flight**.
* Скидає всі значення знайдених сенсорів телеметрії.
* Скидає стани всіх логічних перемикачів.
* Запускає ті ж самі перевірки, що й під час завантаження моделі — тобто положення газу, стан перемикачів, перевірку налаштування failsafe, відображення передпольотного списку перевірок (якщо налаштовано), тест на залипання кнопок тощо.

**Reset timer 1 / 2 / 3** - скидає на нуль лише вибраний таймер, незалежно від налаштувань збереження.

**Reset telemetry** - ця опція скидає всі значення знайдених сенсорів телеметрії.

---

Джерело: [EdgeTX User Manual 2.11](https://github.com/EdgeTX/edgetx-user-manual/blob/2.11/color-radios/reset-telemetry.md), ліцензія [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Український переклад підготовлений для dead.md.
