---
title: "EdgeTX Custom Scripts: Lua mixer scripts"
sidebar_label: "Custom Scripts"
description: "Custom Scripts в EdgeTX: Lua mixer scripts, inputs, outputs, параметри скриптів і обмеження кастомної логіки."
sidebar_position: 29
slug: /rc/edgetx-tx16s/model-settings/custom-scripts
---
![Custom Mixer Scripts](../img/color_model_custom-lua.png)

Користувацькі скрипти (Custom Scripts / Mixes Scripts) приймають одне або кілька значень як вхідні дані, виконують певну обробку в коді Lua та видають одне або кілька значень на виході. Кожна модель може мати кілька пов'язаних із нею скриптів мікшерів, і ці скрипти виконуються періодично. Вони працюють подібно до стандартних мікшерів EdgeTX, але водночас надають набагато гнучкіший і потужніший інструмент.

Типові варіанти використання:

* заміна складних мікшерів, які _не є критично важливими_ для функціонування моделі
* складна обробка вхідних даних (Inputs) та реакція на їхній поточний стан та/або їхню історію
* фільтрація значень телеметрії

:::warning
Якщо вихід скрипта використовується як `mixer source`, і **виконання скрипта припиняється (killed)** з будь-якої причини, тоді _вся_ **лінія мікшера вимикається**! Будьте обережні при їх використанні для основного керування. Рекомендується мати резервну лінію мікшера, яка буде використовуватися, якщо з будь-якої причини виконання Mixer Script буде перервано.
:::

![Inputs and Outputs for Mixer Scripts](../img/color_model_custom-lua_edit.png)

Ось приклад скрипта мікшера, який приймає джерело та постійне значення, і має два виходи, які можна буде вибрати в мікшері як джерела.

---

Джерело: [EdgeTX User Manual 2.11](https://github.com/EdgeTX/edgetx-user-manual/blob/2.11/color-radios/model-settings/custom-scripts.md), ліцензія [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Український переклад підготовлений для dead.md.
