// Cloning, export payloads and import detection for classes / students / full backups.
import type { AppData, ClassItem, Status, Student } from "./models";
import { STATUSES } from "./models";
import { allVariants, t } from "./i18n";

const APP_ID = "student-picker";
const FORMAT_VERSION = 1;

export type Incoming =
    | { kind: "all"; data: AppData }
    | { kind: "classes"; classes: ClassItem[] }
    | { kind: "students"; students: Student[] }
    | { kind: "names"; names: string[] };

export function uid() {
    return (crypto as any).randomUUID?.() ?? ("id-" + Math.random().toString(36).slice(2, 11));
}

const nonNull = <T>(v: T | null): v is T => v != null;

function toInt(v: unknown) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/* ========== Normalising (also migrates old saved data) ========== */

export function normalizeStudent(raw: any): Student | null {
    if (!raw || typeof raw !== "object") return null;
    const name = String(raw.name ?? "").trim();
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
        name: String(raw.name ?? "").trim() || t("classes.untitled"),
        students: raw.students.map(normalizeStudent).filter(nonNull),
    };
}

export function normalizeData(raw: any): AppData {
    return {
        classes: Array.isArray(raw?.classes) ? raw.classes.map(normalizeClass).filter(nonNull) : [],
        logs: Array.isArray(raw?.logs) ? raw.logs.filter((l: unknown) => l && typeof l === "object") : [],
    };
}

/* ========== Creating / cloning ========== */

export function newStudent(name: string): Student {
    return { id: uid(), name: name.trim(), status: "present", participationCount: 0, score: 0, hasParticipatedThisRound: false };
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

function parseCsv(text: string): string[][] {
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
        else if (ch === ",") { row.push(cell); cell = ""; }
        else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && text[i + 1] === "\n") i++;
            row.push(cell); rows.push(row); row = []; cell = "";
        } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
}

const norm = (s = "") => s.trim().toLocaleLowerCase();

/** Reads CSV exported in any supported language (header names and values are matched against all translations). */
function fromCsv(text: string): Student[] | null {
    const rows = parseCsv(text);
    const header = rows[0]?.map(c => norm(c));
    if (!header || header.length < 2) return null;
    const col = (key: Parameters<typeof allVariants>[0]) => {
        const names = allVariants(key).map(norm);
        return header.findIndex(c => names.includes(c));
    };
    const iName = col("csv.name");
    if (iName < 0) return null;
    const [iStatus, iScore, iTurns, iPicked] = [col("csv.status"), col("csv.score"), col("csv.turns"), col("csv.picked")];
    const statusByLabel = new Map<string, Status>();
    for (const st of STATUSES) {
        statusByLabel.set(st, st);
        allVariants(`status.${st}`).forEach(label => statusByLabel.set(norm(label), st));
    }
    const yes = allVariants("csv.yes").map(norm);
    return rows.slice(1).map(r => normalizeStudent({
        name: r[iName],
        status: statusByLabel.get(norm(r[iStatus])),
        score: r[iScore],
        participationCount: r[iTurns],
        hasParticipatedThisRound: yes.includes(norm(r[iPicked])),
    })).filter(nonNull);
}

/** One name per line; strips list bullets, turns spreadsheet tabs into spaces. */
export function splitNames(text: string): string[] {
    return text.split(/\r?\n/)
        .map(line => line.replace(/^[\s\-*•·]+/, "").replace(/\t+/g, " ").trim())
        .filter(Boolean);
}

function interpret(obj: any): Incoming | null {
    if (Array.isArray(obj)) {
        const classes = obj.map(normalizeClass).filter(nonNull);
        if (classes.length) return { kind: "classes", classes };
        if (obj.every(x => typeof x === "string")) {
            const names = obj.map(x => x.trim()).filter(Boolean);
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

export function parseIncoming(text: string): Incoming | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (/^[[{]/.test(trimmed)) {
        try {
            return interpret(JSON.parse(trimmed));
        } catch {
            return null;
        }
    }
    const csv = fromCsv(trimmed);
    if (csv) return csv.length ? { kind: "students", students: csv } : null;
    const names = splitNames(trimmed);
    return names.length ? { kind: "names", names } : null;
}
