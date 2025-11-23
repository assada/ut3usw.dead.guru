---
title: Unihertz Titan 2
description: Titan 2 5G QWERTY смартфон. Огляд і користувацький досвід.
comments: true
tags: [personal, belongings, smartphone]
---

![Unihertz Titan 2](./img/titan2.jpeg)

https://www.unihertz.com/products/titan-2

Давно хотів собі смартфон з фізичною QWERTY-клавіатурою. Чисто випадково скролив кікстертер і натрапив на Unihertz Titan 2.
4 місяці очікування і ось він у мене в руках. Перші враження - це величезний телефон. Він реально великий і прямокутний. Екран квадратний, корпус квадратний. Я не можу сказати що він добре лежить в руці. А сучасні додатки не розраховані на екрани з співвідношенням сторін 1:1. Але це не головне. Я готовий терпіти погану камеру, жахливий динамік і незручний розмір заради фізичної клавіатури. В 2025 році це єдиний можливий спосіб отримати QWERTY смартфон, тому треба працювати з тим що є.

Одразу ставимо F-Droid, Termux, git, vim і в принципі можна писати код в театрі, на зустрічах і в за ~~кермом~~. Тут android 15, штатна клавіатура не підтримує українську мову тому прийшлось перезібрати під себе KeyoneKB(ох я і настраждався поки оновлював весь той говнокод під Android 15). Але воно того варте. Писати на фізичній клавіатурі це велика розкіш.

## Root

:::warning
цей процес повністю зітре всі ваші дані і налаштування! Робіть резервні копії.
:::

Рут встав без проблем. Загалом інструкція стандартна:

1. Вмикаємо Developer Options (5-10 разів тицяємо по Build Number в About Phone)
2. Settings -> System -> Developer Options вмикаємо **OEM unlocking** і **USB debugging**
3. Качаємо і встановлюємо [Magisk](https://github.com/topjohnwu/Magisk/releases) 
4. Качаємо вашу прошивку з офіційного сайту [джерела](https://drive.google.com/drive/folders/122rcnaWHDoRbJMmgMxdaRfMElZonQiOg)
5. Розпаковуємо прошивку, знаходимо там `init_boot.img`
6. `init_boot.img` треба пропатчити через Magisk Manager (Install -> Select and Patch a File)
7. На комп'ютер скидаємо пропатчений `init_boot.img` (назва буде типу `magisk_patched-29000_xxxxx.img`)
8. Підключаємо до компа через USB, відкриваємо термінал і вводимо:

```bash
adb reboot bootloader
```
9. Після перезавантаження в режим fastboot вводимо(пристрій зависне на екрані завантаження без жодного прогресу, це нормально, просто почекайте хвилинку і йдіть далі):

```bash
fastboot flashing unlock
```

10. Після розблокування завантажувача знову вводимо:

```bash
fastboot --slot all flash init_boot magisk_patched-29000_xxxxx.img
```

11. Після успішного прошивання вводимо:

```bash
fastboot reboot
```

Готово! Маємо рутований телефон.

Далі UAD-NG https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation знищуємо все від гугла і непотрібне сміття. Все що потрібно є в F-Droid.