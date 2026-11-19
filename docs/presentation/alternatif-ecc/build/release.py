# Makes the offline, single-file release: release/sunum.html with fonts and screenshots embedded.
# Usage: python3 -I release.py   (fonts are downloaded once into build/fonts/, later runs work offline)
import base64, os, re, sys, urllib.request
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.dirname(B); P = os.path.dirname(A)
SRC, OUT = os.path.join(A, 'final-sunum.html'), os.path.join(P, 'release', 'sunum.html')
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}   # makes Google serve woff2
page = open(SRC, encoding='utf-8').read()
uri = lambda path, mime: f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

# fonts: Google CSS -> local woff2 files (cached) -> embedded @font-face rules
url = re.search(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/[^"]+)">', page).group(1)
fonts = os.path.join(B, 'fonts'); os.makedirs(fonts, exist_ok=True)
css_path = os.path.join(fonts, 'fonts.css')
if not os.path.exists(css_path):
    css = urllib.request.urlopen(urllib.request.Request(url.replace('&amp;', '&'), headers=UA)).read().decode()
    def save(m):
        name = re.sub(r'[^\w.-]', '_', m.group(1).split('/s/')[-1])
        open(os.path.join(fonts, name), 'wb').write(urllib.request.urlopen(m.group(1)).read())
        return f'url({name})'
    open(css_path, 'w', encoding='utf-8').write(re.sub(r'url\((https://[^)]+)\)', save, css))
css = re.sub(r'url\(([^)]+\.woff2)\)', lambda m: f"url({uri(os.path.join(fonts, m.group(1)), 'font/woff2')})", open(css_path, encoding='utf-8').read())
page = page.replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n', '')
page = page.replace(f'<link rel="stylesheet" href="{url}">', f'<style>\n{css}</style>')

# screenshots
page = re.sub(r'src="\.\./screenshots/([^"]+\.png)"', lambda m: f'src="{uri(os.path.join(P, "screenshots", m.group(1)), "image/png")}"', page)

left = re.findall(r'(?:src|href)="(?!data:|https?://|#)[^"]+"', page) + re.findall(r'fonts\.g(?:oogleapis|static)\.com/(?!css2\?family=[^ ]* \*/)', page)
assert not left, f'still external: {left}'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(page)
print(f'release: {OUT} ({os.path.getsize(OUT) // 1024} KB)')
