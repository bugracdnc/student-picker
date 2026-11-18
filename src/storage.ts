// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
import type { AppData } from "./models.ts"

const KEY = "student-picker:v1";

export function loadData(): AppData {
    let raw: string | null = null;
    try {
        raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw) as AppData;
    } catch {
        console.warn("Saved data is unreadable or storage is blocked; starting fresh");
        // Keep the unreadable copy so the next save does not destroy it.
        try { if (raw) localStorage.setItem(`${KEY}:unreadable`, raw); } catch { /* ignore */ }
    }
    return { classes: [], logs: [] };
}

/** Returns false when the browser refuses to store (quota full, storage disabled). */
export function saveData(data: AppData): boolean {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
        return true;
    } catch {
        return false;
    }
}

export function downloadFile(filename: string, content: string, mime = "application/json") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsText(file);
    })
}
