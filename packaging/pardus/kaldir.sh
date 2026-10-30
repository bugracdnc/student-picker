#!/bin/sh
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
# Copyright (C) 2026 Buğra Çalışkandinç
# Removes a per-user Student Picker install made by kur.sh.
# Saved classes live in the browser and are NOT deleted; reinstalling brings them back.
set -eu
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
DESKTOP_DIR=$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")
rm -rf "$DATA/student-picker"
rm -f "$DATA/applications/student-picker.desktop" "$DESKTOP_DIR/student-picker.desktop" \
      "$HOME/Desktop/student-picker.desktop" "$HOME/Masaüstü/student-picker.desktop"
case "${LANG:-}" in
    tr*) echo "Öğrenci Seçici kaldırıldı." ;;
    *) echo "Student Picker removed." ;;
esac
