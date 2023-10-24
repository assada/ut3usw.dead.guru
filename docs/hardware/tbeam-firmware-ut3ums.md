---
title: Meshtastic для TBEAM
description: Прошивка TBEAM модему для роботи з Meshtastic
---
:::caution

Це спосіб прошивки модему в "ручному" режимі при умові проблем з platformio аддону в VSCode.

Опис проекту та інструкції по прошивці від автора проекту можна знайти тут [meshtastic.md](/docs/ham/meshtastic.md)

:::


# Self build

Для збірки проєкту нам знадобиться
[platformio](https://docs.platformio.org/en/latest/core/installation/shell-commands.html)
([PlatformIO · GitHub](https://github.com/platformio), open source) це
набір скриптів, конфігурацій, темплейтів, тощо для роботи
embedded-розробників. Щось на кшталт pip/npm.
`platformio.ini` - конфігураційний файл в корені проєкту
визначає архітектуру, специфічні потреби, параметри компіляції.
Існтрумент `platformio` або скорочено `pio`
самостійно завантажує потрібний тулчейн, налаштовує і виконує збірку
прошивки та заливку артефактів збірки на пристрої. Без цього, я думаю,
збирати тулчейн для плати буде складніше. Особливо людям без досвіду в
embedded.

Реокмендований офіційним сайтом спосіб встановлення platformio

``` {#станом на <2023-07-22 Sat 00:43> це офіційні рекомендації команди platformio по встановленню існтурментарію .bash org-language="sh" eval="never"}
wget https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py -O get-platformio.py
python3 get-platformio.py

# наступні кроки для того, щоб систем "знала" про pio, яке буде встановлене у директорю користувача
sudo ln -s ~/.platformio/penv/bin/pio  /usr/local/bin/pio
# або додайте ~/.platformio/penv/bin/pio в змінну $PATH, як це зробити залежить від багатьох факторів вашої системи
```

Нам знадобиться вихідний код meshtastic, який ми будемо модифікувтаи.
Крім того я використовував деякі скрипти з директорії
`firmware/bin`, але про це згодом.

``` {#отримання вихідного коду meshtastic .bash org-language="sh" eval="never"}
git clone https://github.com/meshtastic/firmware.git && cd meshtastic && git submodule update --init
```

На цьому етапі вам має бути доступний код meshtastic. Для прикладу
[змінимо максимальну
потужність](https://wikimesh.pp.ua/uk/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F/%D0%97%D0%B1%D1%96%D0%BB%D1%8C%D1%88%D0%B5%D0%BD%D0%BD%D1%8F_%D0%BF%D0%BE%D1%82%D1%83%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%96)
передавача для мого регіону та [додаму українські
літери](https://wikimesh.pp.ua/uk/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F/%D0%A3%D0%B2%D1%96%D0%BC%D0%BA%D0%BD%D0%B5%D0%BD%D0%BD%D1%8F_%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%BE%D1%97_%D0%BC%D0%BE%D0%B2%D0%B8)
у екранний шрифт.

Трохи почитавши інтернет та сам файл конфігурації
`platformio.ini` я знайшов два способи запустити збірку
проєкту:

``` {#збірка з указанням оточення (environment) .bash org-language="sh" eval="never"}
pio run -e tbeam
```

або просто відредагувати `platformio.ini` розкоментувавши
своє оточення і закоментувавши решту. У мене плата Lilygo Tbeam, тому у
моєму конфізі буде щось таке:

``` example
[platformio]
default_envs = tbeam
```

Не зважаючи на успішний білд, команда прошивки
`pio run -t upload` повернула незрозумілі помилки контрольних
сум. Можливо в цьому винне саме моє оточення - чув що робота esptool для
ядер :+ ще не стабільна. В будь-якому, на цьому кроці я вже маю артифакт
`firmware.bin`. `pio` поклав їх в піддиректорію
проєкту: `.pio/build/tbeam/firmware.bin`

``` {#meshtastic build + flash, .bash org-language="sh" eval="never"}
pio run -t upload
```

Намагаючись розібратися з прошивкою, я запустив
`esptool chip_id`, программа звалилась на середині роботи,
через неможливість відкрити такий файл:
`/usr/lib/python3/dist-packages/esptool/targets/stub_flasher/stub_flasher_32.json`.
Документація каже що це готові шаблони пам\'яті, які esptool закидує в
пристрій при прошивці. Простого підкладання файлу з офіційного
репозиторію на місце допомогла запустити `esptool`, але
`pio` все ще скаржився на md5. В решті решт я натрапив на
скріпт у директорії `./bin`. Скріпт закінчився із
попередженнями та помилками, але прошивка пройшла успішно. Після
кофігурації присторю я побачив українську мову на дисплеї і зміг
виставити рівень 14dBm, а не дефолтні 12.

``` {#Альтернативний спосіб прошивки .bash org-language="sh" eval="never"}
./bin/device-install.sh -f ../.pio/build/tbeam/firmware.bin
```