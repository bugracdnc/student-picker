// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
// Cloning, export payloads and import detection for classes / students / full backups.
import type { AppData, ClassItem, Status, Student } from "./models";
import { STATUSES } from "./models";
import { allVariants, t } from "./i18n";

const APP_ID = "student-picker";
const FORMAT_VERSION = 1;
// shortcut: nothing reads logs yet, so only the newest are kept to stay under the ~5 MB storage quota; revisit if a history view is added.
export const MAX_LOGS = 500;

export type Incoming =
    | { kind: "all"; data: AppData }
    | { kind: "classes"; classes: ClassItem[] }
    | { kind: "students"; students: Student[] }
    | { kind: "names"; names: string[] };

export function uid() {
    return (crypto as any).randomUUID?.() ?? ("id-" + Math.random().toString(36).slice(2, 11));
}

const nonNull = <T>(v: T | null): v is T => v != null;

const MAX_NAME = 100;

/** Normalises a typed or imported name: no invisible/control/bidi characters, single spaces, sane length. */
export function cleanName(raw: unknown): string {
    return String(raw ?? "")
        .normalize("NFC")
        .replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_NAME);
}

function toInt(v: unknown) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/* ========== Normalising (also migrates old saved data) ========== */

export function normalizeStudent(raw: any): Student | null {
    if (!raw || typeof raw !== "object") return null;
    const name = cleanName(raw.name);
    if (!name) return null;
    return {
        id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
        name,
        status: STATUSES.includes(raw.status) ? raw.status as Status : "present",
        participationCount: toInt(raw.participationCount),
        score: toInt(raw.score),
        hasParticipatedThisRound: !!raw.hasParticipatedThisRound,
    };
}

export function normalizeClass(raw: any): ClassItem | null {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.students)) return null;
    return {
        id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
        name: cleanName(raw.name) || t("classes.untitled"),
        students: raw.students.map(normalizeStudent).filter(nonNull),
    };
}

export function normalizeData(raw: any): AppData {
    return {
        classes: Array.isArray(raw?.classes) ? raw.classes.map(normalizeClass).filter(nonNull) : [],
        logs: Array.isArray(raw?.logs) ? raw.logs.filter((l: unknown) => l && typeof l === "object").slice(-MAX_LOGS) : [],
    };
}

/* ========== Creating / cloning ========== */

export function newStudent(name: string): Student {
    return { id: uid(), name: cleanName(name), status: "present", participationCount: 0, score: 0, hasParticipatedThisRound: false };
}

export function cloneStudent(s: Student, opts: { resetStats?: boolean } = {}): Student {
    const copy: Student = { ...s, id: uid() };
    if (opts.resetStats) {
        copy.score = 0;
        copy.participationCount = 0;
        copy.hasParticipatedThisRound = false;
    }
    return copy;
}

export function cloneClass(c: ClassItem, opts: { resetStats?: boolean } = {}): ClassItem {
    return { id: uid(), name: c.name, students: c.students.map(s => cloneStudent(s, opts)) };
}

/* ========== Export payloads ========== */

const meta = (kind: string) => ({ app: APP_ID, kind, version: FORMAT_VERSION, exportedAt: new Date().toISOString() });

export const allPayload = (data: AppData) => ({ ...meta("all"), classes: data.classes, logs: data.logs });
export const classPayload = (c: ClassItem) => ({ ...meta("class"), class: c });
export const studentsPayload = (students: Student[]) => ({ ...meta("students"), students });

const csvCell = (v: string) => /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export function toCsv(c: ClassItem, students = c.students): string {
    const rows = [
        [t("csv.name"), t("csv.status"), t("csv.score"), t("csv.turns"), t("csv.picked")],
        ...students.map(s => [s.name, t(`status.${s.status}` as const), String(s.score), String(s.participationCount), t(s.hasParticipatedThisRound ? "csv.yes" : "csv.no")]),
    ];
    return rows.map(r => r.map(csvCell).join(",")).join("\r\n");
}

/* ========== Import detection ========== */

function parseCsv(text: string, delim: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; }
                else quoted = false;
            } else cell += ch;
        } else if (ch === '"') quoted = true;
        else if (ch === delim) { row.push(cell); cell = ""; }
        else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && text[i + 1] === "\n") i++;
            row.push(cell); rows.push(row); row = []; cell = "";
        } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
}

const norm = (s = "") => s.trim().toLocaleLowerCase();

// Header names from other sources (spreadsheets, e-Okul lists). Our own headers come from translations.
const FULL_NAME_HEADERS = ["ad soyad", "adı soyadı", "adi soyadi", "ad-soyad", "öğrenci", "öğrenci adı", "isim", "isim soyisim", "student", "student name", "full name", "fullname"];
const FIRST_NAME_HEADERS = ["adı", "adi", "first name", "firstname", "given name"];
const LAST_NAME_HEADERS = ["soyadı", "soyadi", "soyad", "last name", "lastname", "surname", "family name"];

/** Reads CSV/TSV in any supported language. Excel in Turkish saves with ";", spreadsheet copies use tabs. */
function fromCsv(text: string): Student[] | null {
    const top = text.split(/\r?\n/, 10).join("\n");
    const delim = ["\t", ";", ","].map(d => [d, top.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0];
    const rows = parseCsv(text, delim);
    const statusByLabel = new Map<string, Status>();
    for (const st of STATUSES) {
        statusByLabel.set(st, st);
        allVariants(`status.${st}`).forEach(label => statusByLabel.set(norm(label), st));
    }
    const yes = allVariants("csv.yes").map(norm);
    // The header may sit below a few title rows (e.g. school name), so look for it.
    for (let h = 0; h < Math.min(rows.length, 10); h++) {
        const header = rows[h].map(c => norm(c));
        const col = (names: string[]) => header.findIndex(c => names.includes(c));
        const own = (key: Parameters<typeof allVariants>[0]) => col(allVariants(key).map(norm));
        const iName = own("csv.name") >= 0 ? own("csv.name") : col(FULL_NAME_HEADERS);
        const [iFirst, iLast] = [col(FIRST_NAME_HEADERS), col(LAST_NAME_HEADERS)];
        if (iName < 0 && (iFirst < 0 || iLast < 0)) continue;
        const [iStatus, iScore, iTurns, iPicked] = [own("csv.status"), own("csv.score"), own("csv.turns"), own("csv.picked")];
        return rows.slice(h + 1).map(r => normalizeStudent({
            name: iName >= 0 ? r[iName] : `${r[iFirst] ?? ""} ${r[iLast] ?? ""}`,
            status: statusByLabel.get(norm(r[iStatus])),
            score: r[iScore],
            participationCount: r[iTurns],
            hasParticipatedThisRound: yes.includes(norm(r[iPicked])),
        })).filter(nonNull);
    }
    return null;
}

/**
 * One name per line, or a single line separated by commas/semicolons ("Ali, Ayşe; Can").
 * Strips bullets, "1." / "2)" numbering, wrapping quotes and trailing commas; tabs become spaces.
 */
export function splitNames(text: string): string[] {
    const lines = text.split(/\r\n|\r|\n/);
    const parts = lines.filter(l => l.trim()).length === 1 ? text.split(/[,;]/) : lines;
    return parts
        .map(line => cleanName(line
            .replace(/\t+/g, " ")
            .trim()
            .replace(/^[-*•·–—]+\s*/, "")
            .replace(/^\d{1,3}\s*[.)]\s*(?=\p{L})/u, "")
            .replace(/[,;]$/, "")
            .replace(/^["'“”‘’«»](.*)["'“”‘’«»]$/, "$1")))
        .filter(Boolean);
}

function interpret(obj: any): Incoming | null {
    if (Array.isArray(obj)) {
        const classes = obj.map(normalizeClass).filter(nonNull);
        if (classes.length) return { kind: "classes", classes };
        if (obj.every(x => typeof x === "string")) {
            const names = obj.map(cleanName).filter(Boolean);
            return names.length ? { kind: "names", names } : null;
        }
        const students = obj.map(normalizeStudent).filter(nonNull);
        return students.length ? { kind: "students", students } : null;
    }
    if (!obj || typeof obj !== "object") return null;
    if (obj.kind === "class" && obj.class) {
        const c = normalizeClass(obj.class);
        return c ? { kind: "classes", classes: [c] } : null;
    }
    if (obj.kind === "students" && Array.isArray(obj.students)) {
        const students = obj.students.map(normalizeStudent).filter(nonNull);
        return students.length ? { kind: "students", students } : null;
    }
    if (Array.isArray(obj.classes)) return { kind: "all", data: normalizeData(obj) };
    const c = normalizeClass(obj);
    if (c) return { kind: "classes", classes: [c] };
    const s = normalizeStudent(obj);
    return s ? { kind: "students", students: [s] } : null;
}

/** Several copied payloads pasted one after another: `{...}{...}` or one per line. */
function interpretConcatenated(text: string): Incoming | null {
    let parsed: unknown[];
    try {
        parsed = JSON.parse(`[${text.replace(/}\s*,?\s*{/g, "},{")}]`);
    } catch {
        return null;
    }
    const parts = parsed.map(interpret);
    if (!parts.length || parts.some(p => !p)) return null;
    if (parts.every(p => p!.kind === "classes")) return { kind: "classes", classes: parts.flatMap(p => p!.kind === "classes" ? p!.classes : []) };
    if (parts.every(p => p!.kind === "students" || p!.kind === "names")) {
        return { kind: "students", students: parts.flatMap(p => p!.kind === "students" ? p!.students : p!.kind === "names" ? p!.names.map(newStudent) : []) };
    }
    return null;
}

/**
 * Detects what pasted/dropped text is, most specific first:
 * Student Picker JSON (backup, class, students) → other JSON → CSV/TSV with a name column → a list of names.
 * Text that looks like JSON but cannot be read is rejected instead of being split into "names".
 */
export function parseIncoming(text: string): Incoming | null {
    const trimmed = text.replace(/^\ufeff/, "").trim();
    if (!trimmed) return null;
    if (/^[[{]/.test(trimmed)) {
        try {
            return interpret(JSON.parse(trimmed));
        } catch {
            return interpretConcatenated(trimmed);
        }
    }
    const csv = fromCsv(trimmed);
    if (csv) return csv.length ? { kind: "students", students: csv } : null;
    const names = splitNames(trimmed);
    return names.length ? { kind: "names", names } : null;
}
