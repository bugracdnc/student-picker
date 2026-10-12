import type { AppData } from "./models.ts"

const KEY = "student-picker:v1";

export function loadData(): AppData {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
        return { classes: [], logs: [] }
    }
    try {
        return JSON.parse(raw) as AppData;
    } catch (error) {
        console.warn("Failed to parse saved data; starting fresh");
        return { classes: [], logs: [] };
    }
}

export function saveData(data: AppData) {
    localStorage.setItem(KEY, JSON.stringify(data));
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
