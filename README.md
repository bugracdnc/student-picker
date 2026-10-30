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

Student Picker is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

- It is free for teachers, students, schools (state and private) and personal use. The source code is public, so anyone can read it and learn from it.
- **Additional permission:** teachers may use it in any lesson, including paid private tutoring.
- Not permitted: selling or renting copies, paid subscriptions or paid hosted versions, ads, bundling it into paid products, paid installation packages, or any other way of making money from the software or from modified versions of it.
- Modified versions must keep the Required Notice from the [LICENSE](LICENSE) file and may only be shared noncommercially.
- Contributors: by contributing, you agree that your contribution may be relicensed by the project maintainer.

Öğrenci Seçici, [PolyForm Noncommercial Lisansı 1.0.0](LICENSE) ile lisanslanmıştır.

- Öğretmenler, öğrenciler, okullar (devlet ve özel) ve kişisel kullanım için ücretsizdir. Kaynak kodu herkese açıktır; herkes okuyup ondan öğrenebilir.
- **Ek izin:** Öğretmenler onu, ücretli özel dersler dahil her derste kullanabilir.
- İzin verilmeyenler: kopyalarını satmak veya kiralamak, ücretli abonelik ya da ücretli barındırılan sürümler, reklam, ücretli ürünlere eklemek, ücretli kurulum paketleri veya yazılımdan ya da değiştirilmiş sürümlerinden başka herhangi bir yolla para kazanmak.
- Değiştirilmiş sürümler [LICENSE](LICENSE) dosyasındaki Required Notice (Zorunlu Bildirim) satırını korumalıdır ve yalnızca ticari olmayan amaçlarla paylaşılabilir.
- Katkıda bulunanlar: Katkıda bulunarak, katkınızın proje sorumlusu tarafından yeniden lisanslanabileceğini kabul etmiş olursunuz.

Required Notice: Copyright (C) 2026 Buğra Çalışkandinç — Student Picker (https://github.com/bugracdnc/student-picker)

### License history / Lisans geçmişi

- Commits up to `27f75b6` were briefly published under AGPL-3.0-or-later on 2026-10-30. From 0.1.0-alpha.2 onward the project is licensed under PolyForm Noncommercial 1.0.0.
- `27f75b6` dahil olmak üzere o commit'e kadarki sürümler 2026-10-30 tarihinde kısa bir süre AGPL-3.0-or-later lisansıyla yayımlandı. 0.1.0-alpha.2 sürümünden itibaren proje PolyForm Noncommercial 1.0.0 ile lisanslanmıştır.
