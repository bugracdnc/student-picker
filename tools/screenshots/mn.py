# Minimal Marionette client (Firefox's built-in automation protocol), no geckodriver needed.
import json, socket, subprocess, time, tempfile, os, base64, sys
PORT = 2899
class MN:
    def __init__(self, w, h, scale):
        self.prof = tempfile.mkdtemp(dir=os.environ.get("SP"))
        open(f"{self.prof}/user.js", "w").write(
            f'user_pref("marionette.port", {PORT});\n'
            f'user_pref("layout.css.devPixelsPerPx", "{scale}");\n'
            'user_pref("ui.prefersReducedMotion", 0);\n'
            'user_pref("browser.shell.checkDefaultBrowser", false);\n')
        self.p = subprocess.Popen(["firefox", "--headless", "--marionette", "--no-remote", "-profile", self.prof,
                                   f"--window-size={w},{h}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try: self.s = socket.create_connection(("127.0.0.1", PORT)); break
            except OSError: time.sleep(0.2)
        self.buf = b""; self.id = 0; self._read()
        self.cmd("WebDriver:NewSession", {})
        self.cmd("WebDriver:SetWindowRect", {"width": w, "height": h})
    def _read(self):
        while b":" not in self.buf: self.buf += self.s.recv(65536)
        n, rest = self.buf.split(b":", 1); n = int(n)
        while len(rest) < n: rest += self.s.recv(1 << 20)
        self.buf = rest[n:]; return json.loads(rest[:n])
    def cmd(self, name, params):
        self.id += 1; m = json.dumps([0, self.id, name, params]).encode()
        self.s.sendall(str(len(m)).encode() + b":" + m)
        while True:
            r = self._read()
            if r[0] == 1 and r[1] == self.id:
                if r[2]: raise RuntimeError(r[2])
                return r[3]
    def js(self, src, *args): return self.cmd("WebDriver:ExecuteScript", {"script": src, "args": list(args)}).get("value")
    def shot(self, path):
        open(path, "wb").write(base64.b64decode(self.cmd("WebDriver:TakeScreenshot", {"full": False})["value"]))
    def quit(self):
        try: self.cmd("Marionette:Quit", {})
        except Exception: pass
        self.p.wait(10)
