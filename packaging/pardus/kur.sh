#!/bin/sh
# Student Picker / Öğrenci Seçici — installer for Pardus (and other Linux desktops).
#
# Installs for the current user only, no admin password needed:
#   ~/.local/share/student-picker/       the app and its launcher
#   ~/.local/share/applications/         applications-menu entry
#   ~/Desktop (or ~/Masaüstü)            desktop shortcut
#
# Run it again at any time to update to the newest release; saved classes are kept.
#
#   wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kur.sh | sh
set -eu

REPO="bugracdnc/student-picker"
APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/student-picker"
MENU_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE="student-picker.desktop"

case "${LANG:-}${LC_ALL:-}" in
    *tr_TR*|tr*) TR=1 ;;
    *) TR=0 ;;
esac
say() { if [ "$TR" = 1 ]; then echo "$1"; else echo "$2"; fi; }
fail() { say "HATA: $1" "ERROR: $2" >&2; exit 1; }

fetch() { # fetch URL FILE
    if command -v wget >/dev/null 2>&1; then wget -q -O "$2" "$1"
    elif command -v curl >/dev/null 2>&1; then curl -fsSL -o "$2" "$1"
    else fail "wget ya da curl bulunamadı." "wget or curl is required."
    fi
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Use files next to this script if they are there (unpacked release), otherwise download them.
SRC=""
case "$0" in */*) SRC=$(dirname "$0") ;; esac
if [ -n "$SRC" ] && [ -f "$SRC/student-picker.html" ] && [ -f "$SRC/launch" ]; then
    say "Yerel dosyalar kullanılıyor..." "Using local files..."
    cp "$SRC/student-picker.html" "$SRC/launch" "$SRC/student-picker.svg" "$SRC/$DESKTOP_FILE" "$TMP/"
else
    say "En yeni sürüm aranıyor..." "Looking for the newest release..."
    fetch "https://api.github.com/repos/$REPO/releases?per_page=1" "$TMP/releases.json" \
        || fail "İnternet bağlantısını kontrol edin." "Check your internet connection."
    TAG=$(grep -m1 '"tag_name"' "$TMP/releases.json" | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')
    HTML_URL=$(grep -o '"browser_download_url": *"[^"]*student-picker\.html"' "$TMP/releases.json" | head -n1 | sed 's/.*"\(https[^"]*\)"/\1/')
    [ -n "$TAG" ] && [ -n "$HTML_URL" ] || fail "Sürüm bilgisi okunamadı." "Could not read release information."
    say "Sürüm $TAG indiriliyor..." "Downloading $TAG..."
    RAW="https://raw.githubusercontent.com/$REPO/$TAG/packaging/pardus"
    fetch "$HTML_URL" "$TMP/student-picker.html"
    for f in launch student-picker.svg "$DESKTOP_FILE"; do fetch "$RAW/$f" "$TMP/$f"; done
fi

mkdir -p "$APP_DIR" "$MENU_DIR"
cp "$TMP/student-picker.html" "$TMP/launch" "$TMP/student-picker.svg" "$APP_DIR/"
chmod 755 "$APP_DIR/launch"
sed -e "s|@LAUNCH@|\"$APP_DIR/launch\"|" -e "s|@ICON@|$APP_DIR/student-picker.svg|" \
    "$TMP/$DESKTOP_FILE" > "$MENU_DIR/$DESKTOP_FILE"
chmod 755 "$MENU_DIR/$DESKTOP_FILE"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$MENU_DIR" 2>/dev/null || true

# Desktop shortcut. Desktops only open "trusted" shortcuts without asking, so mark it.
DESKTOP_DIR=$(xdg-user-dir DESKTOP 2>/dev/null || true)
[ -n "$DESKTOP_DIR" ] && [ "$DESKTOP_DIR" != "$HOME" ] || DESKTOP_DIR="$HOME/Desktop"
[ -d "$DESKTOP_DIR" ] || DESKTOP_DIR="$HOME/Masaüstü"
if [ -d "$DESKTOP_DIR" ]; then
    SHORTCUT="$DESKTOP_DIR/$DESKTOP_FILE"
    cp "$MENU_DIR/$DESKTOP_FILE" "$SHORTCUT"
    chmod 755 "$SHORTCUT"
    if command -v gio >/dev/null 2>&1; then
        gio set "$SHORTCUT" metadata::trusted true 2>/dev/null || true
        SUM=$(sha256sum "$SHORTCUT" | cut -d' ' -f1)
        gio set -t string "$SHORTCUT" metadata::xfce-exe-checksum "$SUM" 2>/dev/null || true
    fi
fi

echo
say "Kurulum tamamlandı! \"Öğrenci Seçici\" simgesi masaüstünde ve uygulama menüsünde." \
    "Done! \"Student Picker\" is on your desktop and in the applications menu."
