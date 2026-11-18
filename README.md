# Student Picker · Öğrenci Seçici

Fair random student picker for classrooms and smart boards. Nobody is picked twice until everyone present has had a turn. Attendance, plus/minus points, several classes, English and Turkish. Runs offline as a single HTML file; data stays in the browser.

Sınıflar ve akıllı tahtalar için adil, rastgele öğrenci seçici. Herkes söz almadan kimse ikinci kez seçilmez. Yoklama, artı/eksi puan, birden fazla sınıf; Türkçe ve İngilizce. İnternetsiz çalışır, bilgiler tarayıcıda kalır.

> **Alpha** — expect rough edges; take backups. / **Alfa** — deneme sürümüdür; yedek almayı unutmayın.

## Guides / Kılavuzlar

- 🇹🇷 [Kullanım Kılavuzu](docs/kullanim-kilavuzu.md) — kurulum, kullanım, yedekleme
- 🇬🇧 [User Guide](docs/user-guide.md) — installing, using, backups

## Quick install on Pardus / Pardus'a hızlı kurulum

- **Package / Paket:** download the `.deb` from [Releases](https://github.com/bugracdnc/student-picker/releases) and double-click it. / [Sürümler](https://github.com/bugracdnc/student-picker/releases) sayfasından `.deb` dosyasını indirip çift tıklayın.
- **No admin password / Yönetici şifresi olmadan** (Terminal / Uçbirim):

  ```
  wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kur.sh | sh
  ```

- **No install / Kurulumsuz:** download `student-picker.html` and open it in a browser.

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # dist/student-picker.html
npm run release   # release/: html, .deb, offline tarball, kur.sh
```

`npm run release` needs `dpkg-deb`. Pardus packaging files (launcher, desktop entry, icon, install/uninstall scripts) live in `packaging/pardus/`.

### Publishing a release

1. Bump `version` in `package.json` (e.g. `0.1.0-alpha.2`).
2. `npm run release`
3. `gh release create v<version> --prerelease release/*`

`kur.sh` installs whatever the newest release on GitHub is (pre-releases included), so existing users update by running it again.

## License / Lisans

Student Picker is free software under the [GNU Affero General Public License v3.0 or later](LICENSE) (AGPL-3.0-or-later). Anyone may use, study, modify and share it. If you share a modified version, including by hosting it on a website, you must make its source code available under the same license. The name and logo are not covered by the license; see [TRADEMARKS.md](TRADEMARKS.md).

Öğrenci Seçici, [GNU Affero Genel Kamu Lisansı v3.0 veya sonrası](LICENSE) (AGPL-3.0-or-later) ile lisanslanmış özgür bir yazılımdır. Herkes onu kullanabilir, inceleyebilir, değiştirebilir ve paylaşabilir. Değiştirilmiş bir sürümü paylaşırsanız (bir web sitesinde yayınlamak dahil), kaynak kodunu aynı lisansla açık tutmanız gerekir. Ad ve logo lisansa dahil değildir; bkz. [TRADEMARKS.md](TRADEMARKS.md).

Contributions are accepted under the same license (AGPL-3.0-or-later). / Katkılar aynı lisansla (AGPL-3.0-or-later) kabul edilir.

Copyright (C) 2026 Buğra Çalışkandinç

### License history / Lisans geçmişi

- `0.1.0-alpha.1` was published without a license. Commit `27f75b6` was published under AGPL-3.0-or-later on 2026-10-30. `0.1.0-alpha.2` was released under PolyForm Noncommercial 1.0.0; copies of that release keep those terms. Everything after it is AGPL-3.0-or-later again.
- `0.1.0-alpha.1` lisanssız yayımlandı. `27f75b6` commit'i 2026-10-30 tarihinde AGPL-3.0-or-later ile yayımlandı. `0.1.0-alpha.2` PolyForm Noncommercial 1.0.0 ile yayımlandı; o sürümün kopyaları bu koşullarla kalır. Sonraki her şey yeniden AGPL-3.0-or-later lisanslıdır.
