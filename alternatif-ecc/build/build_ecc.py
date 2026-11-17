# Builds the alternative ECC decks from the slide content below; speaker notes come from deck/project/slides/*.html (copies of the Artifact deck).
import re, os, sys, html
TPL, DECK, OUT = sys.argv[1:4]
def note(id):
    s = open(os.path.join(DECK, id + '.html'), encoding='utf-8').read()
    return re.search(r'<aside>(.*?)</aside>', s, re.S).group(1).strip()
def slide(id, num, body, cls=''):
    n = f'<div class="num" aria-hidden="true">{num:02d}</div>' if num else ''
    return f'''<section class="slide {cls}" id="{id}">
  {n}<div class="slide-content">
{body}
  </div>
  <aside class="notes">{html.escape(note(id), quote=False)}</aside>
</section>'''
K = lambda t: f'<p class="kicker reveal">{t}</p>'
H2 = lambda t: f'<h2 class="reveal">{t}</h2>'
L = lambda t: f'<p class="lead reveal">{t}</p>'
IMG = '../screenshots/'
def shot(id, num, img, alt, title, line, btns=()):
    lines = ''.join(L(x) for x in ([line] if isinstance(line, str) else line))
    pic = f'<img class="shot reveal" src="{IMG}{img}" alt="{alt}">'
    if btns:  # small crops of the app's own buttons under the screenshot
        pic = (f'<div style="display:flex;flex-direction:column;gap:clamp(.5rem,2vh,1.5rem);align-items:center">'
               + pic.replace('class="shot reveal"', 'class="shot reveal" style="max-height:64vh"')
               + '<div class="reveal" style="display:flex;gap:clamp(.5rem,1vw,1rem)">'
               + ''.join(f'<img src="{IMG}{b}" alt="{a}" style="height:clamp(36px,8vh,96px);border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25)">' for b, a in btns)
               + '</div></div>')
    return slide(id, num, f'''<div class="split">
  {pic}
  <div style="display:flex;flex-direction:column;gap:var(--content-gap)">{K('Uygulamadan')}{H2(title)}{lines}</div>
</div>''')
dots = '<div class="dots reveal" aria-label="30 öğrenci; ön sıralardan 4 kişi parmak kaldırıyor">' + ''.join(
    '<i class="up"></i>' if i in (1, 3, 8, 10) else '<i></i>' for i in range(30)) + '</div>'
def bars(rows, maxv, stacked):
    out = []
    for lbl, v, z, me in rows:
        if stacked and not me:
            w0, w1 = z / maxv * 100, (v - z) / maxv * 100
            track = f'<div class="track grow"><div class="seg zero" style="width:{w0:.1f}%">{z}</div><div class="seg one" style="width:{w1:.1f}%">{v - z}</div></div>'
        else:
            track = f'<div class="track grow"><div class="seg solid" style="width:{max(v / maxv * 100, 1):.1f}%"></div></div>'
        out.append(f'<div class="bar-row{" me" if me else ""}"><span class="lbl">{lbl}</span>{track}<span class="val">{v}</span></div>')
    return ''.join(out)
left = bars([('Parmak kaldırma', 14, 8, 0), ('Öğretmenin seçimi', 7, 2, 0), ('İsim çarkı', 6, 1, 0), ('Öğrenci Seçici', 0, 0, 1)], 14.06, True)
right = bars([('Parmak kaldırma', 13, 0, 0), ('Öğretmenin seçimi', 7, 0, 0), ('İsim çarkı', 7, 0, 0), ('Öğrenci Seçici', 3, 0, 1)], 12.62, False)

S = [
slide('kapak', 0, f'''<p class="kicker reveal">Öğrenci Seçici</p>
<h1 class="reveal">Herkese<br>eşit söz</h1>
<p class="lead reveal">Sınıfta söz hakkını adil dağıtan seçici</p>
<p class="small reveal" style="font-size:var(--label-size)"><b style="color:var(--ink)">Buğra Çalışkandinç</b> · Milli Eğitim Akademisi Aday Öğretmeni</p>'''),
slide('icindekiler', 0, f'''{K('İçindekiler')}{H2('Sunumun akışı')}
<div class="grid2 reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card" style="flex-direction:row;align-items:center"><span class="step-n" style="min-width:1.2em">{i}</span><div><h3>{h}</h3><p class="lead" style="font-size:var(--label-size)">{d}</p></div></div>' for i, (h, d) in enumerate([
        ('Neden?', 'Söz hakkı sınıfta eşit dağılmıyor.'), ('Nasıl çalışır?', 'Tek kural, ekranlar ve yapım süreci.'),
        ('Ne kadar fark eder?', 'Dört yöntem, bir aylık simülasyon.'), ('Sınıfta kullanım', 'İpuçları ve üç kurulum yolu.')], 1)) + '</div>'),
slide('sahne', 1, f'''<div class="row" style="align-items:center">
  <div style="display:flex;flex-direction:column;gap:var(--content-gap)">{K('Neden?')}{H2('Tanıdık bir sahne')}{L('Hep aynı eller kalkıyor; sınıfın çoğu sessiz kalıyor.')}</div>
  <div style="display:flex;justify-content:center">{dots}</div>
</div>'''),
slide('ingilizce', 0, f'''{K('Dil dersinde')}<h2 class="reveal">Söz hakkı, konuşma pratiği demek.</h2>{L('Parmak kaldırmayan, genellikle en çok pratiğe ihtiyacı olandır.')}''', 'statement'),
slide('kural', 2, f'''{K('Uygulamanın tek kuralı')}<h2 class="reveal" style="font-size:var(--title-size);max-width:17ch">Herkes söz almadan, kimse <span style="color:var(--accent)">ikinci kez</span> seçilmez.</h2>{L('Sıra rastgele, söz hakkı eşit; “Hep beni seçiyorsunuz” itirazı biter.')}'''),
slide('isleyis', 3, f'''{K('Nasıl çalışır?')}{H2('Bir tur, beş adım')}{L('Herkes bir kez söz alınca yeni tur başlar; yanlış basışta “Geri al” düğmesi var.')}
<div class="row reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card"><span class="step-n">{i}</span><h3>{t}</h3></div>' for i, t in enumerate(['Sınıf listesi', 'Yoklama', 'Seçim havuzu', 'Rastgele seçim', 'Yeni tur'], 1)) + '</div>'),
shot('ekran-secim', 4, 'z1-ana.png', 'Seçim ekranı: Öğrenci seç düğmesi, sayaçlar ve ilerleme çubuğu', 'Seçim ekranı', 'Tek düğme; altta derste olan, sırada bekleyen ve söz alan sayısı.'),
shot('ekran-koyu', 4, 'z5-ana-koyu.png', 'Seçim ekranı koyu temada', 'Koyu tema da var', 'Ay/güneş düğmesiyle açık ya da koyu temaya geçilir.', [('btn-moon.png', 'Açık temada ay düğmesi'), ('btn-sun.png', 'Koyu temada güneş düğmesi')]),
shot('ekran-ingilizce', 4, 'z6-ana-en.png', 'Seçim ekranı İngilizce arayüzle', '“It also comes in English!”', 'EN/TR tek dokunuşla değişir; öğrenciler arayüzde de İngilizce görür.', [('btn-en-tr.png', 'EN / TR dil düğmesi, EN seçili')]),
shot('ekran-isim', 4, 'z2-isim.png', 'Seçilen öğrencinin adı büyük, altında −1 ve +1 düğmeleri', 'Söz sende', 'İsim arka sıradan da okunur; +1 / −1 puan isteğe bağlı.'),
shot('ekran-liste', 4, 'z3-kartlar.png', 'Öğrenci kartları: Var / Yok / Pas düğmeleri ve Seçildi rozeti', 'Yoklama ve tur', ['Yok ya da Pas olan öğrenci seçilmez. Pas, derste olup o gün söz almayacak öğrenci içindir.', '“Seçildi” rozeti, turda kimin konuştuğunu gösterir; o öğrenci tur bitene kadar tekrar seçilmez.']),
shot('ekran-tablo', 4, 'z4-tablo.png', 'Tur tamamlandı ekranı ve puan tablosu', 'Tur bitti', 'Puan tablosu kimin kaç kez konuştuğunu da tutar.'),
slide('yapim', 5, f'''{K('Nasıl yapıldı?')}{H2('Sınıfın ihtiyacından doğdu')}{L('Eylül 2025’ten beri kendi derslerimde; Ekim 2026’da ilk deneme sürümü.')}
<div class="grid2 reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card"><h3>{t}</h3></div>' for t in ['İnternetsiz', 'Veri tahtada kalır', 'Pardus’a hazır', 'Türkçe / İngilizce']) + '</div>'
  + '<p class="lead reveal" style="max-width:none;font-size:var(--label-size);margin-top:var(--content-gap)">Öğrenci Seçici, tahtadaki tarayıcıda bir web sayfası gibi açılan tek bir dosyadır ve internete bağlanmadan çalışır. Kendi derslerimde gördüğüm ihtiyaçlara göre adım adım geliştirdim; öğrenci adları ve puanlar yalnızca o tahtada saklanır.</p>'),
slide('sim-kurulum', 6, f'''{K('Ne kadar fark eder?')}{H2('30 öğrenci, 15 ders, 90 söz hakkı')}{L('Eşit dağılsa herkes <b>3 kez</b> konuşurdu. Her yöntemi 5.000 kez denedim.')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div class="card"><h3>Parmak kaldırma</h3><p class="lead" style="font-size:var(--label-size)">5 öğrenci sık, 10 öğrenci ara sıra, 15 öğrenci nadiren parmak kaldırır</p></div><div class="card"><h3>Öğretmenin seçimi</h3><p class="lead" style="font-size:var(--label-size)">Ön sıralar daha çok akla gelir</p></div><div class="card"><h3>İsim çarkı</h3><p class="lead" style="font-size:var(--label-size)">Rastgele seçer ama kimin konuştuğunu hatırlamaz</p></div><div class="focal card"><h3>Öğrenci Seçici</h3><p class="lead" style="font-size:var(--label-size)">Herkes konuşmadan kimse tekrar seçilmez</p></div>
</div>'''),
slide('sim-sonuc', 6, f'''{K('Sonuçlar')}{H2('Bir ayda söz hakkı nasıl dağıldı?')}{L('Parmak kaldırmada 8 öğrenci bir ay boyunca hiç konuşmuyor; Öğrenci Seçici’de herkes 3 kez konuşuyor.')}
<div class="row reveal" style="margin-top:var(--content-gap);gap:clamp(1rem,4vw,5rem)">
  <div class="chart"><h3>Bir ayda en fazla 1 kez konuşan öğrenci</h3><div class="legend"><span style="--c:var(--ink-2)">hiç konuşmayan</span><span style="--c:var(--muted-bar)">1 kez konuşan</span></div>{left}</div>
  <div class="chart"><h3>En çok konuşan öğrenci kaç kez söz aldı? <span style="color:var(--ink-2)">(eşit dağılımda 3)</span></h3>{right}</div>
</div>'''),
slide('buyuk-sayi', 0, f'''{H2('Rastgele seçmek, adil seçmek demek değil')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div><p class="big">11<small>/30</small></p><p class="lead">İsim çarkı: 30 soruda ortalama hiç seçilmeyen</p><p class="small">Çark önceki seçimleri hatırlamaz; bazıları 2–3 kez çıkar.</p></div>
  <div><p class="big" style="color:var(--accent)">0<small>/30</small></p><p class="lead">Öğrenci Seçici: hiç seçilmeyen</p></div>
</div>'''),
slide('ipuclari', 7, f'''{K('Sınıfta kullanım')}{H2('Kaygıyı artırmadan söz vermek')}{L('Amaç öğrenciyi yakalamak değil, herkese söz hakkı tanımak.')}
<div class="grid2 reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card" style="flex-direction:row;align-items:center"><span class="step-n" style="font-size:var(--h3-size);min-width:1.4em">0{i}</span><h3>{t}</h3></div>' for i, t in enumerate(['Önce soru, sonra isim', 'Düşünme süresi', 'Önce ikili prova', 'Çabayı ödüllendirin'], 1)) + '</div>'),
slide('kurulum', 8, f'''{K('Her branş, her akıllı tahta')}{H2('Pardus’ta üç kurulum yolu')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div class="card"><span class="step-n">1</span><h3>Paketle</h3><p class="lead" style="font-size:var(--label-size)">.deb dosyasına çift tıkla (yönetici şifresi gerekir)</p></div>
  <div class="card"><span class="step-n">2</span><h3>Şifresiz</h3><p class="lead" style="font-size:var(--label-size)">Uçbirim’e tek satır yapıştır</p></div>
  <div class="card"><span class="step-n">3</span><h3>Kurulumsuz</h3><p class="lead" style="font-size:var(--label-size)">HTML dosyasını tarayıcıda aç</p></div>
</div>'''),
slide('kapanis', 0, f'''<h1 class="reveal">Teşekkürler</h1>
<p class="lead reveal">Uygulama ve kılavuz:</p>
<p class="reveal" style="font-family:var(--font-display);font-size:var(--h3-size);color:var(--accent)">github.com/bugracdnc/student-picker</p>
<div class="small reveal" style="margin-top:var(--content-gap);max-width:120ch">
<p><b style="color:var(--accent)">Kaynaklar</b></p>
<p>Aguillon, S. M., Siegmund, G.-F., Petipas, R. H., Drake, A. G., Cotner, S. ve Ballen, C. J. (2020). Gender differences in student participation in an active-learning classroom. <i>CBE—Life Sciences Education</i>, 19(2), ar12. https://doi.org/10.1187/cbe.19-03-0048</p>
<p>Botes, E., Dewaele, J.-M. ve Greiff, S. (2020). The Foreign Language Classroom Anxiety Scale and academic achievement: An overview of the prevailing literature and a meta-analysis. <i>Journal for the Psychology of Language Learning</i>, 2(1), 26–56. https://doi.org/10.52598/jpll/2/1/3</p>
<p>Dallimore, E. J., Hertenstein, J. H. ve Platt, M. B. (2013). Impact of cold-calling on student voluntary participation. <i>Journal of Management Education</i>, 37(3), 305–341. https://doi.org/10.1177/1052562912446067</p>
</div>'''),
]
assert len(S) == 19
# optional: argv[4] = comma-separated slide ids to keep, argv[5] = extra theme CSS file
if len(sys.argv) > 4:
    keep = sys.argv[4].split(',')
    S = sorted((x for x in S if re.search(r'id="([^"]+)"', x).group(1) in keep), key=lambda x: keep.index(re.search(r'id="([^"]+)"', x).group(1)))
page = open(TPL, encoding='utf-8').read().replace('%SLIDES%', '\n'.join(S))
if len(sys.argv) > 5:
    css = open(sys.argv[5], encoding='utf-8').read()
    fonts = re.search(r'/\* fonts: (.*?) \*/', css).group(1)
    page = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]*">', f'<link rel="stylesheet" href="{fonts}">', page)
    page = page.replace('</style>', css + '\n</style>')
if len(sys.argv) > 7:  # optional credit line for the closing slide's reference list
    marker = 'https://doi.org/10.1177/1052562912446067</p>'
    assert marker in page
    page = page.replace(marker, marker + '\n<p>' + sys.argv[7] + '</p>')
if len(sys.argv) > 6:  # optional theme script, appended after the controller
    page = page.replace('</body>', '<script>\n' + open(sys.argv[6], encoding='utf-8').read() + '\n</script>\n</body>')
open(OUT, 'w', encoding='utf-8').write(page)
print('slides:', len(S))
