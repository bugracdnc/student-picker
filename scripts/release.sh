#!/bin/sh
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Buğra Çalışkandinç
# Builds release files into release/:
#   student-picker.html                     the whole app in one file
#   student-picker_<version>_all.deb        Pardus/Debian package (double-click to install)
#   student-picker-pardus.tar.gz            app + kur.sh, for installing without internet
set -eu
cd "$(dirname "$0")/.."

VERSION=$(node -p 'require("./package.json").version')
DEB_VERSION=$(echo "$VERSION" | sed 's/-/~/')   # 0.1.0-alpha.1 -> 0.1.0~alpha.1 sorts before 0.1.0
OUT=release
P=packaging/pardus

node node_modules/typescript/bin/tsc
node node_modules/vite/bin/vite.js build
rm -rf "$OUT" && mkdir -p "$OUT"
cp dist/index.html "$OUT/student-picker.html"

# --- .deb ---
ROOT=$(mktemp -d)
trap 'rm -rf "$ROOT"' EXIT
install -d "$ROOT/DEBIAN" "$ROOT/usr/bin" "$ROOT/usr/share/student-picker" \
    "$ROOT/usr/share/applications" "$ROOT/usr/share/icons/hicolor/scalable/apps" \
    "$ROOT/usr/share/doc/student-picker"
install -m 644 "$OUT/student-picker.html" "$ROOT/usr/share/student-picker/"
# Debian has no AGPL in /usr/share/common-licenses, so the full text goes in the copyright file
{
    cat "$P/copyright"
    echo
    echo "License: AGPL-3.0-or-later"
    sed -e 's/^[[:space:]]*$/./' -e 's/^/ /' LICENSE
} > "$ROOT/usr/share/doc/student-picker/copyright"
chmod 644 "$ROOT/usr/share/doc/student-picker/copyright"
install -m 755 "$P/launch" "$ROOT/usr/share/student-picker/launch"
ln -s ../share/student-picker/launch "$ROOT/usr/bin/student-picker"
install -m 644 "$P/student-picker.svg" "$ROOT/usr/share/icons/hicolor/scalable/apps/"
sed -e 's|@LAUNCH@|student-picker|' -e 's|@ICON@|student-picker|' "$P/student-picker.desktop" \
    > "$ROOT/usr/share/applications/student-picker.desktop"
chmod 644 "$ROOT/usr/share/applications/student-picker.desktop"
cat > "$ROOT/DEBIAN/control" <<CONTROL
Package: student-picker
Version: $DEB_VERSION
Architecture: all
Maintainer: Buğra Çalışkandinç <bugracaliskandinc@gmail.com>
Depends: firefox-esr | firefox | chromium | xdg-utils
Section: education
Priority: optional
Homepage: https://github.com/bugracdnc/student-picker
Description: Fair random student picker for classrooms
 Öğrenci Seçici: sınıfta adil söz hakkı için rastgele öğrenci seçer.
 Works offline in the browser; designed for interactive smart boards.
CONTROL
find "$ROOT" -type d -exec chmod 755 {} +
dpkg-deb --root-owner-group -Zxz --build "$ROOT" "$OUT/student-picker_${DEB_VERSION}_all.deb"

# --- offline bundle ---
B="$ROOT/bundle/student-picker"
mkdir -p "$B"
cp "$OUT/student-picker.html" "$P/launch" "$P/student-picker.svg" "$P/student-picker.desktop" "$P/kur.sh" "$P/kaldir.sh" "$B/"
tar -C "$ROOT/bundle" -czf "$OUT/student-picker-pardus.tar.gz" student-picker

cp "$P/kur.sh" "$OUT/"
ls -l "$OUT"
