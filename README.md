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
