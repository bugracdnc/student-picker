# Öğrenci Seçici — Kullanım Kılavuzu

*[English version](user-guide.md)*

Öğrenci Seçici, derste söz verilecek öğrenciyi rastgele ve **adil** biçimde seçer: sınıftaki herkes bir kez söz almadan kimse ikinci kez seçilmez. Yoklama tutabilir, öğrencilere artı/eksi puan verebilir, birden fazla sınıfı yönetebilirsiniz.

İnternet gerekmez, hesap açmak gerekmez. Bilgiler yalnızca kullandığınız bilgisayarda (ya da akıllı tahtada) saklanır.

> **Not:** Bu bir **deneme (alfa) sürümüdür**. Düzenli olarak yedek almanızı öneririz (bkz. [Bilgilerinizi korumak](#bilgilerinizi-korumak)).

---

## İçindekiler

1. [Kurulum](#kurulum)
2. [İlk sınıfınızı oluşturmak](#ilk-sınıfınızı-oluşturmak)
3. [Öğrenci seçmek](#öğrenci-seçmek)
4. [Yoklama: Var / Yok / Pas](#yoklama-var--yok--pas)
5. [Puan vermek](#puan-vermek)
6. [Birden fazla sınıf](#birden-fazla-sınıf)
7. [Bilgilerinizi korumak](#bilgilerinizi-korumak)
8. [Başka bir tahtaya taşımak](#başka-bir-tahtaya-taşımak)
9. [Güncelleme ve kaldırma](#güncelleme-ve-kaldırma)
10. [Sık sorulan sorular](#sık-sorulan-sorular)

---

## Kurulum

Size uyan **bir** yolu seçin. Hangisini seçeceğinizden emin değilseniz **1. Yol** ile başlayın; yönetici şifresi isterse **2. Yol**'a geçin.

### 1. Yol — Paket Yükleyici ile (önerilen)

Bilgisayarın yönetici şifresini biliyorsanız en kolay yol budur.

1. Şu sayfayı açın: **<https://github.com/bugracdnc/student-picker/releases>**
2. En üstteki sürümün altında, **Assets** başlığındaki adı **`.deb`** ile biten dosyaya tıklayın (ör. `student-picker_0.1.0~alpha.1_all.deb`). Dosya indirilir.
3. **İndirilenler** klasörünü açıp indirdiğiniz dosyaya **çift tıklayın**.
4. Açılan **Pardus Paket Yükleyici** penceresinde **Yükle** düğmesine basın ve şifre sorulursa yönetici şifresini girin.
5. Bitti! Uygulama menüsünü açıp **Öğrenci Seçici** yazarak uygulamayı bulabilirsiniz.

> Masaüstüne simge koymak için: uygulama menüsünde **Öğrenci Seçici**'ye sağ tıklayıp **Masaüstüne ekle** seçeneğini kullanın (menüde bu seçenek yoksa 2. Yol masaüstü simgesini kendisi oluşturur).

### 2. Yol — Tek satırla (yönetici şifresi gerekmez)

Okuldaki akıllı tahtalarda genellikle yönetici şifresi olmaz. Bu yolda şifre gerekmez; yalnızca bir satırı kopyalayıp yapıştıracaksınız.

1. Uygulama menüsünü açın, **Uçbirim** yazın ve açın. (Siyah ya da beyaz bir yazı penceresi açılır.)
2. Aşağıdaki satırın tamamını kopyalayın:

   ```
   wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kur.sh | sh
   ```

3. Uçbirim penceresine **sağ tıklayıp Yapıştır**'ı seçin (ya da **Ctrl + Shift + V** tuşlarına basın), ardından **Enter**'a basın.
4. Birkaç saniye içinde *"Kurulum tamamlandı!"* yazısını göreceksiniz. Uçbirim penceresini kapatabilirsiniz.
5. **Öğrenci Seçici** simgesi artık masaüstünüzde ve uygulama menüsünde.

### 3. Yol — Kurmadan kullanmak

1. [Sürümler sayfasından](https://github.com/bugracdnc/student-picker/releases) **`student-picker.html`** dosyasını indirin.
2. Dosyaya çift tıklayın; uygulama tarayıcıda açılır.

Dosyayı her zaman **aynı yerden** açın (örneğin Belgeler klasörüne taşıyıp oradan). Dosyayı taşırsanız ya da başka bir tarayıcıyla açarsanız sınıflarınız görünmeyebilir — bu durumda [yedeğinizi geri yükleyin](#yedeği-geri-yüklemek).

---

## İlk sınıfınızı oluşturmak

Uygulama, bilgisayarınızın dili Türkçeyse Türkçe açılır. Sağ üstteki **TR / EN** düğmeleriyle dili istediğiniz zaman değiştirebilirsiniz.

1. **İlk sınıfını oluştur** düğmesine basın (ya da sol taraftaki **Sınıflar** başlığının yanındaki **+** düğmesine).
2. Sınıfa bir ad verin, örneğin *9-A Matematik*, ve **Sınıf oluştur**'a basın.
3. Sağ taraftaki **Öğrenciler** bölümünde **Öğrenci ekle**'ye basın.
4. Her satıra bir öğrenci gelecek şekilde isimleri yazın:

   ```
   101 Ayşe Yılmaz
   102 Mehmet Demir
   103 Zeynep Kaya
   ```

5. **Öğrenci ekle**'ye basın.

> **İpucu:** Sınıf listesini e-Okul'dan, Excel'den veya bir belgeden kopyalayıp doğrudan bu kutuya yapıştırabilirsiniz. Her satır bir öğrenci olur; numara ve isim birlikte gelir.

---

## Öğrenci seçmek

- Ortadaki büyük **Öğrenci seç** düğmesine dokunun. İsimler kısa bir süre döner ve seçilen öğrencinin adı büyük harflerle görünür.
- Klavye bağlıysa **Boşluk** tuşuna basmak da aynı işi görür.
- Seçilen öğrenci bu tur boyunca bir daha seçilmez. Ekranın altındaki çubuk, kaç öğrencinin söz aldığını ve kaçının **sırada beklediğini** gösterir.
- Derste olan herkes söz aldığında **Yeni tura başla** düğmesi çıkar; basınca herkes yeniden listeye girer. Turu istediğiniz zaman **Yeni tur** düğmesiyle de baştan başlatabilirsiniz.

Yanlışlıkla bir şeye bastıysanız ekranın altında çıkan **Geri al** düğmesini kullanabilirsiniz.

---

## Yoklama: Var / Yok / Pas

Her öğrencinin kartında üç düğme vardır:

| Düğme | Anlamı |
|---|---|
| **Var** | Öğrenci derste, seçilebilir. (Yeni eklenen herkes "Var" başlar.) |
| **Yok** | Öğrenci gelmedi, seçilmez. |
| **Pas** | Öğrenci derste ama bugün söz almayacak (ör. revirde, sunum yapıyor). Seçilmez. |

Tüm sınıfı tek seferde işaretlemek için **Öğrenciler** başlığının yanındaki **⋯** (üç nokta) düğmesine basıp **Hepsini "var" işaretle** / **Hepsini "yok" işaretle** seçeneklerini kullanın.

Yoklama durumu siz değiştirene kadar kalır; ertesi derse geldiğinizde gerekirse güncelleyin.

---

## Puan vermek

- Seçilen öğrencinin adının altında **−1** ve **+1** düğmeleri çıkar. Doğru cevaba artı, gerekirse eksi verebilirsiniz.
- Her öğrencinin kartında da **−** ve **+** düğmeleri vardır.
- Ekranın altındaki **Puan tablosu**, öğrencileri puana göre sıralar ve kaç kez söz aldıklarını gösterir.
- Puanları sıfırlamak için: sınıfın **⋯** menüsünden **Puanları ve söz sayılarını sıfırla**.

---

## Birden fazla sınıf

Sol taraftaki **Sınıflar** listesinden bir sınıfa dokunarak sınıflar arasında geçiş yapabilirsiniz. Her sınıfın **⋯** menüsünde şunlar bulunur:

- **Yeniden adlandır**
- **Çoğalt…** — Aynı öğrencilerle yeni bir sınıf açar (ör. aynı şubeye farklı bir ders girdiğinizde). **Sıfırdan başlat** kutucuğunu işaretlerseniz kopyada puanlar sıfır olur.
- **CSV olarak dışa aktar** — Sınıf listesini puanlarıyla birlikte Excel/LibreOffice'te açılabilen bir dosya olarak indirir.
- **Sınıfı sil** — Hemen ardından çıkan **Geri al** ile geri getirebilirsiniz.

Bir öğrenciyi başka bir sınıfa taşımak için öğrencinin kartındaki **⋯** düğmesinden **Sınıfa taşı…** seçeneğini kullanın. Birçok öğrenciyi birden işlemek için **Öğrenciler** başlığının yanındaki **Çoklu seçim** düğmesine basın.

---

## Bilgilerinizi korumak

Sınıflarınız bu bilgisayardaki tarayıcının içinde saklanır. Bu yüzden:

- Uygulamayı **her zaman aynı simgeden** açın.
- Tarayıcının **geçmişini / çerezlerini / site verilerini temizlerseniz** sınıflarınız silinebilir.
- Okuldaki tahtalar dönem sonunda sıfırlanıyor olabilir.

**Ayda bir (ya da önemli bir değişiklikten sonra) yedek alın:**

1. Sağ üstteki **Yedekle** düğmesine basın.
2. `student-picker-TARİH.json` adında bir dosya **İndirilenler** klasörüne kaydedilir.
3. Bu dosyayı bir USB belleğe ya da e-postanıza kaydedin.

### Yedeği geri yüklemek

1. Sağ üstteki **İçe aktar** düğmesine basın ve yedek dosyasını seçin. (Dosyayı uygulama penceresinin üzerine sürükleyip bırakmak da olur.)
2. Uygulamada zaten sınıf varsa size sorulur:
   - **Yeni sınıf olarak ekle** — Mevcut sınıflarınız kalır, yedektekiler yanlarına eklenir.
   - **Hepsini değiştir** — Mevcut her şey silinir, yerine yedek gelir.

---

## Başka bir tahtaya taşımak

1. İlk tahtada **Yedekle**'ye basın ve dosyayı USB belleğe kopyalayın.
2. Diğer tahtaya Öğrenci Seçici'yi [kurun](#kurulum).
3. **İçe aktar**'a basıp USB bellekteki dosyayı seçin.

Sadece tek bir sınıfı paylaşmak isterseniz sınıfın **⋯** menüsünden **JSON olarak dışa aktar**'ı kullanın; bu dosyayı bir meslektaşınıza verebilirsiniz, o da **İçe aktar** ile kendi uygulamasına ekler.

---

## Güncelleme ve kaldırma

**Güncellemek için** kurulumu aynı şekilde tekrarlayın (1. Yol'da yeni `.deb` dosyasını indirip çift tıklayın, 2. Yol'da aynı satırı yeniden yapıştırın). Sınıflarınız silinmez.

**Kaldırmak için:**

- 1. Yol ile kurduysanız: Uygulama menüsünden **Pardus Yazılım Merkezi**'ni açın, *student-picker* aratın ve **Kaldır**'a basın. Orada bulamazsanız Uçbirim'e `sudo apt remove student-picker` yazıp Enter'a basın ve yönetici şifresini girin.
- 2. Yol ile kurduysanız: Uçbirim'e şu satırı yapıştırıp Enter'a basın:

  ```
  wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kaldir.sh | sh
  ```

---

## Sık sorulan sorular

**Masaüstündeki simgeye tıklayınca "güvenilmeyen uygulama" uyarısı çıkıyor.**
Simgeye sağ tıklayıp **Başlatılmasına izin ver** (ya da **Güvenilir olarak işaretle**) seçeneğini seçin. Bu yalnızca bir kez gerekir.

**Sınıflarım kayboldu!**
Uygulama farklı bir tarayıcıda ya da farklı bir yerden açılmış olabilir. Önce her zamanki simgeden açmayı deneyin. Olmazsa son yedeğinizi [geri yükleyin](#yedeği-geri-yüklemek).

**Aynı öğrenci tekrar tekrar seçiliyor mu?**
Hayır. Bir turda herkes en fazla bir kez seçilir. Tur bitince **Yeni tura başla** demeniz gerekir.

**Ekran çok koyu / çok açık.**
Sağ üstteki **güneş / ay** simgesiyle açık ve koyu tema arasında geçiş yapabilirsiniz. Güneşli sınıflarda açık tema daha rahat okunur.

**İnternet olmadan çalışır mı?**
Evet. Kurulumdan sonra internet gerekmez.

**Öğrenci bilgileri bir yere gönderiliyor mu?**
Hayır. Her şey yalnızca bu bilgisayarda kalır.

**Bir sorun buldum / önerim var.**
Lütfen bana doğrudan yazın ya da <https://github.com/bugracdnc/student-picker/issues> adresinden bildirin. Ekran görüntüsü çok yardımcı olur.
