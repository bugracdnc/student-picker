import json, sys, time, random
from mn import MN
W, H, SCALE = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
OUT = __import__("os").path.join(__import__("os").path.dirname(__file__), "../../screenshots")
URL = "file:///home/bugra/Programming/Web/student-picker/dist/index.html"
random.seed(7)
names = ["Ayşe Yılmaz","Mehmet Kaya","Zeynep Demir","Emre Çelik","Elif Şahin","Burak Aydın","Defne Arslan","Can Öztürk",
 "Selin Koç","Mert Doğan","Ecem Kurt","Arda Polat","İrem Aksoy","Kerem Yıldız","Nisa Erdem","Yusuf Güneş",
 "Deniz Şen","Ömer Bulut","Duru Kılıç","Efe Korkmaz","Melis Özkan","Kaan Acar","Ela Turan","Barış Uçar"]
def student(i, n, picked=False):
    st = "absent" if i in (5, 17) else "skipped" if i == 23 else "present"  # Burak absent, Barış skipped: all 3 states in view
    pc = random.randint(3, 6)
    return {"id": f"s{i}", "name": n, "status": st, "participationCount": pc,
            "score": random.choice([0, 1, 1, 2, 2, 3, 4, -1]), "hasParticipatedThisRound": picked and st == "present"}
THEME, LANG = 'light', 'tr'
def seed(m, picked_idx):
    data = {"classes": [{"id": "c1", "name": "10-B İngilizce", "students": [student(i, n, i in picked_idx) for i, n in enumerate(names)]},
                        {"id": "c2", "name": "11-A İngilizce", "students": [student(i, n) for i, n in enumerate(names[:20])]}],
            "logs": []}
    random.seed(7)
    m.js("localStorage.clear(); localStorage.setItem('student-picker:v1', arguments[0]);"
         "localStorage.setItem('student-picker:lang',arguments[2]); localStorage.setItem('student-picker:theme',arguments[1]);", json.dumps(data), THEME, LANG)
    m.cmd("WebDriver:Navigate", {"url": URL}); time.sleep(1)
    # headless Firefox draws a white scrollbar track in dark mode; hide scrollbars in the shots
    m.js("const st=document.createElement('style'); st.textContent='*{scrollbar-width:none}'; document.head.append(st)")
m = MN(W, H, SCALE)
try:
    m.cmd("WebDriver:Navigate", {"url": URL})
    for THEME, SUF in (('light', ''), ('dark', '-dark')):
        mid = {0, 2, 3, 7, 9, 14, 18, 21, 23}
        seed(m, mid)
        m.shot(f"{OUT}/1-secim{SUF}.png")
        # seeded Math.random: same picked name in light and dark
        m.js("const sc=document.createElement('script'); sc.textContent='let s=42; Math.random=()=>(s=s*16807%2147483647)/2147483647'; document.head.append(sc); document.querySelector('.pick-btn').click()"); time.sleep(4)
        m.js("document.querySelector('.score-pill.plus').click()"); time.sleep(3)
        m.shot(f"{OUT}/2-isim{SUF}.png")
        seed(m, mid)
        # Slide 8 left box: the student panel down to the 4th card (Var/Yok/Pas + "Seçildi" all visible)
        r = m.js("const p=document.getElementById('studentList').closest('.panel').getBoundingClientRect();"
                 "const c=document.querySelectorAll('#studentList .sc')[3]?.getBoundingClientRect() || document.querySelectorAll('#studentList > div > *')[3].getBoundingClientRect();"
                 "return [p.left, p.top, p.right, c.bottom + 16]")
        from PIL import Image
        k = float(SCALE)
        m.shot(f"{OUT}/_full{SUF}.png")
        Image.open(f"{OUT}/_full{SUF}.png").crop(tuple(round(v * k) for v in r)).save(f"{OUT}/3-liste{SUF}.png")
        seed(m, set(range(24)))
        m.js("const st=document.querySelector('[data-scroll=stage]'); st.scrollTop = document.querySelector('.stage-actions').offsetTop - 24")
        m.shot(f"{OUT}/4-tablo{SUF}.png")
    # English UI, main screen only (slide "It also comes in English!")
    THEME, LANG = 'light', 'en'
    seed(m, mid)
    m.shot(f"{OUT}/1-secim-en.png")
finally:
    m.quit()

# Zoomed crops for the slides (pixel boxes in the 3200x1800 shots; 3-liste is the 800px-wide panel crop)
from PIL import Image
CROPS = {"z1-ana": ("1-secim", (688, 168, 2272, 1344)), "z2-isim": ("2-isim", (680, 310, 2300, 1120)),
         "z3-kartlar": ("3-liste", (16, 470, 770, 1200)), "z4-tablo": ("4-tablo", (704, 152, 2272, 1120)),
         "z5-ana-koyu": ("1-secim-dark", (688, 168, 2272, 1344)),
         "z6-ana-en": ("1-secim-en", (688, 168, 2272, 1344))}
for out, (src, box) in CROPS.items():
    Image.open(f"{OUT}/{src}.png").crop(box).save(f"{OUT}/{out}.png")
