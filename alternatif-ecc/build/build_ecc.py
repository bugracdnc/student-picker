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
def shot(id, num, img, alt, title, line):
    return slide(id, num, f'''<div class="split">
  <img class="shot reveal" src="{IMG}{img}" alt="{alt}">
  <div style="display:flex;flex-direction:column;gap:var(--content-gap)">{K('Uygulamadan')}{H2(title)}{L(line)}</div>
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
slide('sahne', 1, f'''<div class="row" style="align-items:center">
  <div style="display:flex;flex-direction:column;gap:var(--content-gap)">{K('Neden?')}{H2('Tanıdık bir sahne')}{L('Hep aynı eller kalkıyor.')}</div>
  <div style="display:flex;justify-content:center">{dots}</div>
</div>'''),
slide('arastirma', 2, f'''{K('Neden?')}{H2('Araştırmalar ne diyor?')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div class="card"><h3>Söz isteyen hep aynı grup</h3><p class="cite">Aguillon ve ark., 2020</p></div>
  <div class="card"><h3>Kaygı başarıyı düşürür</h3><p class="cite">Botes ve ark., 2020</p></div>
  <div class="focal card" style="background:var(--accent)"><h3>Söz vermek gönüllüleri artırır</h3><p class="big" style="font-size:calc(var(--h3-size) * 1.3);white-space:nowrap">%55 → %77</p><p class="cite" style="color:var(--accent-ink)">Dallimore ve ark., 2013</p></div>
</div>'''),
slide('ingilizce', 0, f'''{K('Dil dersinde')}<h2 class="reveal">Söz hakkı, konuşma pratiği demek.</h2>{L('Parmak kaldırmayan, pratiği de kaçırır.')}''', 'statement'),
slide('kural', 3, f'''{K('Uygulamanın tek kuralı')}<h2 class="reveal" style="font-size:var(--title-size);max-width:17ch">Herkes söz almadan, kimse <span style="color:var(--accent)">ikinci kez</span> seçilmez.</h2>{L('Sıra rastgele, söz hakkı eşit.')}'''),
slide('isleyis', 4, f'''{K('Nasıl çalışır?')}{H2('Bir tur, beş adım')}
<div class="row reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card"><span class="step-n">{i}</span><h3>{t}</h3></div>' for i, t in enumerate(['Sınıf listesi', 'Yoklama', 'Seçim havuzu', 'Rastgele seçim', 'Yeni tur'], 1)) + '</div>'),
shot('ekran-secim', 5, 'z1-ana.png', 'Seçim ekranı: Öğrenci seç düğmesi, sayaçlar ve ilerleme çubuğu', 'Seçim ekranı', 'Tek büyük düğme: dokunun ya da Boşluk’a basın.'),
shot('ekran-koyu', 5, 'z5-ana-koyu.png', 'Seçim ekranı koyu temada', 'Koyu tema da var', 'Karartılmış sınıfta göz yormaz.'),
shot('ekran-ingilizce', 5, 'z6-ana-en.png', 'Seçim ekranı İngilizce arayüzle', '“It also comes in English!”', 'Arayüz her derste ek bir İngilizce girdi olur.'),
shot('ekran-isim', 5, 'z2-isim.png', 'Seçilen öğrencinin adı büyük, altında −1 ve +1 düğmeleri', 'Söz sende', 'İsim arka sıradan da okunur.'),
shot('ekran-liste', 5, 'z3-kartlar.png', 'Öğrenci kartları: Var / Yok / Pas düğmeleri ve Seçildi rozeti', 'Yoklama ve tur', 'Yok ya da Pas olan öğrenci seçilmez.'),
shot('ekran-tablo', 5, 'z4-tablo.png', 'Tur tamamlandı ekranı ve puan tablosu', 'Tur bitti', 'Yeni tur tek dokunuşla başlar.'),
slide('yapim', 6, f'''{K('Nasıl yapıldı?')}{H2('Sınıfın ihtiyacından doğdu')}{L('Eylül 2025’ten beri kendi derslerimde gelişiyor.')}
<div class="grid2 reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card"><h3>{t}</h3></div>' for t in ['İnternetsiz', 'Veri tahtada kalır', 'Pardus’a hazır', 'Türkçe / İngilizce']) + '</div>'),
slide('sim-kurulum', 7, f'''{K('Ne kadar fark eder?')}{H2('30 öğrenci, 15 ders, 90 söz hakkı')}{L('Adil dağılımda herkes <b>3 kez</b> söz alır.')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div class="card"><h3>Parmak kaldırma</h3></div><div class="card"><h3>Öğretmenin seçimi</h3></div><div class="card"><h3>İsim çarkı</h3></div><div class="focal card"><h3>Öğrenci Seçici</h3></div>
</div>'''),
slide('sim-sonuc', 7, f'''{K('Sonuçlar')}{H2('Bir ayda söz hakkı nasıl dağıldı?')}{L('Kısa çubuk daha adil.')}
<div class="row reveal" style="margin-top:var(--content-gap);gap:clamp(1rem,4vw,5rem)">
  <div class="chart"><h3>Ayda en fazla 1 kez konuşan</h3><div class="legend"><span style="--c:var(--ink-2)">hiç</span><span style="--c:var(--muted-bar)">1 kez</span></div>{left}</div>
  <div class="chart"><h3>En çok seçilen öğrenci kaç kez? <span style="color:var(--ink-2)">(adil: 3)</span></h3>{right}</div>
</div>'''),
slide('buyuk-sayi', 0, f'''{H2('Rastgele olmak, adil olmak demek değil')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div><p class="big">11<small>/30</small></p><p class="lead">İsim çarkıyla 30 soruda hiç seçilmeyen</p></div>
  <div><p class="big" style="color:var(--accent)">0<small>/30</small></p><p class="lead">Öğrenci Seçici ile hiç seçilmeyen</p></div>
</div>'''),
slide('ipuclari', 8, f'''{K('Sınıfta kullanım')}{H2('Kaygıyı artırmadan söz vermek')}
<div class="grid2 reveal" style="margin-top:var(--content-gap)">''' + ''.join(
    f'<div class="card" style="flex-direction:row;align-items:center"><span class="step-n" style="font-size:var(--h3-size);min-width:1.4em">0{i}</span><h3>{t}</h3></div>' for i, t in enumerate(['Önce soru, sonra isim', 'Düşünme süresi', 'Önce ikili prova', 'Çabayı ödüllendirin'], 1)) + '</div>'),
slide('kurulum', 9, f'''{K('Her branş, her akıllı tahta')}{H2('Pardus’ta üç kurulum yolu')}
<div class="row reveal" style="margin-top:var(--content-gap)">
  <div class="card"><span class="step-n">1</span><h3>Paketle</h3><p class="lead" style="font-size:var(--label-size)">.deb dosyası</p></div>
  <div class="card"><span class="step-n">2</span><h3>Şifresiz</h3><p class="lead" style="font-size:var(--label-size)">tek satır</p></div>
  <div class="card"><span class="step-n">3</span><h3>Kurulumsuz</h3><p class="lead" style="font-size:var(--label-size)">tarayıcıda aç</p></div>
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
    S = [x for x in S if re.search(r'id="([^"]+)"', x).group(1) in keep]
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
