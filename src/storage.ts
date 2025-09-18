import type { AppData } from "./models.ts"

const KEY = "student-picker:v1";

export function loadData(): AppData {
    const raw = localStorage.getItem(KEY);
    if (!raw) { return { classes:[], logs:[] } }
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

export function exportDataFile(data: AppData) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-picker-data.json";
    a.click();
    URL.revokeObjectURL(url);
}

export function importDataFile(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
            try {
                const parsed = JSON.parse(String(r.result));
                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        };
        r.onerror = () => reject(r.error);
        r.readAsText(file);
    })
}