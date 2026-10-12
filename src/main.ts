// src/main.ts
import type { AppData, ClassItem, Status, Student } from "./models";
import { STATUSES } from "./models";
import { downloadFile, loadData, readFileText, saveData } from "./storage";
import { h, icon, type Child, type IconName } from "./dom";
import { copyText, field, modal, openMenu, promptText, toast, type MenuItem } from "./ui";
import { allVariants, getLang, setLang, t, tRich } from "./i18n";
import { LANGUAGE_NAMES, type Lang, type MessageKey } from "./translations";
import {
    allPayload, classPayload, cloneClass, cloneStudent, newStudent, normalizeData,
    parseIncoming, splitNames, studentsPayload, toCsv, uid, type Incoming,
} from "./transfer";

const classesPanel = document.getElementById("classesPanel")!;
const studentsPanel = document.getElementById("studentsPanel")!;
const mainPanel = document.getElementById("mainPanel")!;
const controlsPanel = document.getElementById("controlsPanel")!;

const THEME_KEY = "student-picker:theme";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

let data: AppData = normalizeData(loadData());
let currentClassId: string | null = data.classes[0]?.id ?? null;
let lastPick: { classId: string; studentId: string } | null = null;
let celebrate = false;
let picking = false;
let studentQuery = "";
let selectMode = false;
const selected = new Set<string>();
let theme = readTheme();

/* ========== Helpers ========== */

function nowISO() {
    return new Date().toISOString();
}

function today() {
    return nowISO().slice(0, 10);
}

function currentClass(): ClassItem | null {
    return data.classes.find(c => c.id === currentClassId) ?? null;
}

function ensureCurrentClass() {
    if (!currentClass()) currentClassId = data.classes[0]?.id ?? null;
}

function persist() {
    saveData(data);
    renderAll();
}

/** Apply a change and offer an Undo toast that restores the previous state. */
function undoable(message: string, change: () => void) {
    const snapshot = JSON.stringify(data);
    const prevClassId = currentClassId;
    change();
    ensureCurrentClass();
    persist();
    toast(message, {
        action: {
            label: t("common.undo"),
            run: () => {
                data = JSON.parse(snapshot);
                currentClassId = prevClassId;
                ensureCurrentClass();
                persist();
            },
        },
    });
}

const byName = (a: Student, b: Student) => a.name.localeCompare(b.name, getLang(), { numeric: true, sensitivity: "base" });

/** Pluralised count, e.g. count("count.students", 3) → "3 students". */
function count(key: MessageKey, n: number) {
    return t(key, { n });
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueName(base: string, taken: string[]) {
    const used = new Set(taken.map(n => n.toLowerCase()));
    if (!used.has(base.toLowerCase())) return base;
    const suffixes = allVariants("common.copySuffix").map(escapeRegExp).join("|");
    const root = base.replace(new RegExp(` \\((?:${suffixes})(?: \\d+)?\\)$`), "");
    const word = t("common.copySuffix");
    for (let i = 1; ; i++) {
        const candidate = i === 1 ? `${root} (${word})` : `${root} (${word} ${i})`;
        if (!used.has(candidate.toLowerCase())) return candidate;
    }
}

function slug(s: string) {
    return s.toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "") || "export";
}

function initials(name: string) {
    const words = name.split(/\s+/).map(w => w.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean);
    if (!words.length) return "?";
    // Grade-style prefixes like "9-A" or "10B" read best as-is.
    if (/\d/.test(words[0]) && words[0].length <= 3) return words[0].toUpperCase();
    const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
    return letters.toUpperCase();
}

function fmtScore(n: number) {
    return n > 0 ? `+${n}` : String(n);
}

function availableIn(cls: ClassItem) {
    return cls.students.filter(s => s.status === "present" && !s.hasParticipatedThisRound);
}

/* ========== Small view builders ========== */

function button(content: Child, onClick: (e: MouseEvent) => void, cls = "btn btn-soft", attrs: Record<string, unknown> = {}) {
    return h("button", { type: "button", class: cls, onclick: onClick, ...attrs }, content);
}

function iconBtn(name: IconName, label: string, onClick: (e: MouseEvent) => void, cls = "", attrs: Record<string, unknown> = {}) {
    return h("button", { type: "button", class: `icon-btn ${cls}`, title: label, "aria-label": label, onclick: onClick, ...attrs }, icon(name));
}

function menuBtn(label: string, items: () => MenuItem[], cls = "") {
    const b: HTMLButtonElement = iconBtn("more", label, e => {
        e.stopPropagation();
        openMenu(b, items());
    }, `menu-btn ${cls}`, { "aria-haspopup": "menu" });
    return b;
}

function avatar(name: string, cls = "") {
    return h("span", { class: `avatar ${cls}` }, initials(name));
}

function emptyState(iconName: IconName, title: string, text: string, ...actions: Child[]) {
    return h("div", { class: "empty" },
        h("span", { class: "empty-icon" }, icon(iconName)),
        h("strong", null, title),
        h("p", null, text),
        actions.length ? h("div", { class: "empty-actions" }, actions) : null,
    );
}

const cancelAction = () => ({ label: t("common.cancel"), value: false, variant: "ghost" } as const);

function newClassPrompt() {
    return promptText(t("classes.new"), { label: t("classes.nameLabel"), placeholder: t("classes.namePlaceholder"), okLabel: t("classes.create") });
}

/* ========== Class actions ========== */

function selectClass(id: string) {
    if (currentClassId !== id) {
        selected.clear();
        selectMode = false;
        studentQuery = "";
    }
    currentClassId = id;
    renderAll();
}

async function createClass() {
    const name = await newClassPrompt();
    if (!name) return;
    const cls: ClassItem = { id: uid(), name, students: [] };
    data.classes.push(cls);
    selectClass(cls.id);
    persist();
}

async function renameClass(cls: ClassItem) {
    const name = await promptText(t("classes.renameTitle"), { label: t("classes.nameLabel"), value: cls.name, okLabel: t("common.rename") });
    if (!name || name === cls.name) return;
    cls.name = name;
    persist();
}

async function duplicateClass(cls: ClassItem) {
    const nameInput = h("input", { class: "input", value: uniqueName(cls.name, data.classes.map(c => c.name)), required: true, autocomplete: "off" });
    const reset = h("input", { type: "checkbox", class: "checkbox" });
    const ok = await modal({
        title: t("classes.duplicateTitle"),
        description: t("classes.duplicateDesc", { name: cls.name, students: count("count.students", cls.students.length) }),
        body: h("div", { class: "stack" },
            field(t("classes.copyName"), nameInput),
            h("label", { class: "check-row" }, reset, h("span", null,
                h("strong", null, t("classes.startFresh")),
                h("small", null, t("classes.startFreshHint")),
            )),
        ),
        actions: [cancelAction(), { label: t("common.duplicate"), value: true, variant: "primary", submit: true }],
        init: () => {
            nameInput.focus();
            nameInput.select();
        },
    });
    if (!ok) return;
    const copy = cloneClass(cls, { resetStats: reset.checked });
    copy.name = nameInput.value.trim() || copy.name;
    data.classes.splice(data.classes.indexOf(cls) + 1, 0, copy);
    selectClass(copy.id);
    persist();
    toast(t("classes.created", { name: copy.name }), { tone: "success" });
}

function deleteClass(cls: ClassItem) {
    undoable(t("classes.deleted", { name: cls.name }), () => {
        data.classes = data.classes.filter(c => c !== cls);
    });
}

function exportClassJson(cls: ClassItem) {
    downloadFile(`${slug(cls.name)}.class.json`, JSON.stringify(classPayload(cls), null, 2));
}

function exportClassCsv(cls: ClassItem) {
    downloadFile(`${slug(cls.name)}.csv`, toCsv(cls), "text/csv");
}

function classMenu(cls: ClassItem): MenuItem[] {
    return [
        { label: t("common.rename"), icon: "edit", run: () => renameClass(cls) },
        { label: t("classes.menuDuplicate"), icon: "duplicate", run: () => duplicateClass(cls) },
        "sep",
        { label: t("classes.copyNames"), icon: "list", run: () => copyText(cls.students.map(s => s.name).join("\n"), t("classes.copiedNames", { names: count("count.names", cls.students.length) })), disabled: !cls.students.length },
        { label: t("classes.copyClass"), icon: "copy", run: () => copyText(JSON.stringify(classPayload(cls), null, 2), t("classes.copiedClass", { name: cls.name })) },
        { label: t("classes.exportJson"), icon: "download", run: () => exportClassJson(cls) },
        { label: t("classes.exportCsv"), icon: "file", run: () => exportClassCsv(cls) },
        "sep",
        { label: t("classes.resetScores"), icon: "reset", run: () => resetStats(cls.students, t("classes.scoresReset", { name: cls.name })), disabled: !cls.students.length },
        { label: t("classes.delete"), icon: "trash", danger: true, run: () => deleteClass(cls) },
    ];
}

/** Ask the user to pick a class (optionally creating a new one). */
async function chooseClass(title: string, excludeId?: string): Promise<ClassItem | null> {
    const options = data.classes.filter(c => c.id !== excludeId);
    const choice = await modal<string>({
        title,
        body: done => h("div", { class: "choice-list" },
            options.map(c => h("button", { type: "button", class: "choice", onclick: () => done(c.id) },
                avatar(c.name),
                h("span", { class: "choice-text" }, h("strong", null, c.name), h("small", null, count("count.students", c.students.length))),
                icon("move"),
            )),
            h("button", { type: "button", class: "choice choice-new", onclick: () => done("__new__") },
                h("span", { class: "avatar avatar-new" }, icon("plus")),
                h("span", { class: "choice-text" }, h("strong", null, t("classes.chooseNew")), h("small", null, t("classes.chooseNewHint"))),
            ),
        ),
        actions: [{ label: t("common.cancel"), value: "", variant: "ghost" }],
    });
    if (!choice) return null;
    if (choice === "__new__") {
        const name = await newClassPrompt();
        if (!name) return null;
        const cls: ClassItem = { id: uid(), name, students: [] };
        data.classes.push(cls);
        return cls;
    }
    return data.classes.find(c => c.id === choice) ?? null;
}

/* ========== Student actions ========== */

async function addStudents(cls: ClassItem) {
    const area = h("textarea", { class: "input textarea", rows: 7, placeholder: t("students.addPlaceholder"), required: true });
    const ok = await modal({
        title: t("students.add"),
        description: h("span", null, tRich("students.addDesc", { name: h("strong", null, cls.name) })),
        body: area,
        actions: [cancelAction(), { label: t("students.add"), value: true, variant: "primary", submit: true }],
        init: () => area.focus(),
    });
    if (!ok) return;
    const names = splitNames(area.value);
    if (!names.length) return;
    cls.students.push(...names.map(newStudent));
    persist();
    toast(t("students.added", { what: names.length === 1 ? names[0] : count("count.students", names.length) }), { tone: "success" });
}

async function renameStudent(s: Student) {
    const name = await promptText(t("students.renameTitle"), { label: t("students.nameLabel"), value: s.name, okLabel: t("common.rename") });
    if (!name || name === s.name) return;
    s.name = name;
    persist();
}

function describeStudents(students: Student[]) {
    return students.length === 1 ? students[0].name : count("count.students", students.length);
}

function duplicateStudents(cls: ClassItem, students: Student[]) {
    if (!students.length) return;
    const taken = cls.students.map(s => s.name);
    for (const s of students) {
        const copy = cloneStudent(s);
        copy.name = uniqueName(s.name, taken);
        taken.push(copy.name);
        cls.students.splice(cls.students.indexOf(s) + 1, 0, copy);
    }
    persist();
    toast(t("students.duplicated", { what: describeStudents(students) }), { tone: "success" });
}

async function transferStudents(cls: ClassItem, students: Student[], mode: "copy" | "move") {
    if (!students.length) return;
    const what = describeStudents(students);
    const target = await chooseClass(t(mode === "move" ? "students.moveTitle" : "students.copyTitle", { what }), cls.id);
    if (!target) return;
    undoable(t(mode === "move" ? "students.movedTo" : "students.copiedTo", { what, target: target.name }), () => {
        target.students.push(...students.map(s => cloneStudent(s)));
        if (mode === "move") {
            cls.students = cls.students.filter(s => !students.includes(s));
            students.forEach(s => selected.delete(s.id));
        }
    });
}

function copyStudents(students: Student[]) {
    copyText(JSON.stringify(studentsPayload(students), null, 2), t("students.copied", { what: describeStudents(students) }));
}

function exportStudents(cls: ClassItem, students: Student[]) {
    const base = students.length === 1 ? slug(students[0].name) : `${slug(cls.name)}-students`;
    downloadFile(`${base}.students.json`, JSON.stringify(studentsPayload(students), null, 2));
}

function setStatus(students: Student[], status: Status) {
    students.forEach(s => s.status = status);
    persist();
}

function adjustScore(cls: ClassItem, s: Student, delta: number) {
    s.score += delta;
    data.logs.push({ type: "score", classId: cls.id, studentId: s.id, delta, ts: nowISO() });
    persist();
}

function resetStats(students: Student[], message: string) {
    undoable(message, () => students.forEach(s => {
        s.score = 0;
        s.participationCount = 0;
        s.hasParticipatedThisRound = false;
    }));
}

function deleteStudents(cls: ClassItem, students: Student[]) {
    if (!students.length) return;
    undoable(t("students.removed", { what: describeStudents(students) }), () => {
        cls.students = cls.students.filter(s => !students.includes(s));
        students.forEach(s => selected.delete(s.id));
    });
}

function studentMenu(cls: ClassItem, s: Student): MenuItem[] {
    return [
        { label: t("common.rename"), icon: "edit", run: () => renameStudent(s) },
        { label: t("common.duplicate"), icon: "duplicate", run: () => duplicateStudents(cls, [s]) },
        { label: t("students.copyToClass"), icon: "copy", run: () => transferStudents(cls, [s], "copy") },
        { label: t("students.moveToClass"), icon: "move", run: () => transferStudents(cls, [s], "move") },
        "sep",
        { label: t("students.copyStudent"), icon: "code", run: () => copyStudents([s]) },
        { label: t("students.exportJson"), icon: "download", run: () => exportStudents(cls, [s]) },
        "sep",
        { label: t("students.resetStats"), icon: "reset", run: () => resetStats([s], t("students.wasReset", { name: s.name })) },
        { label: t("common.delete"), icon: "trash", danger: true, run: () => deleteStudents(cls, [s]) },
    ];
}

/* ========== Picker ========== */

function wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function shuffleAnimation(pool: Student[], chosen: Student) {
    if (reducedMotion.matches || pool.length < 2) return wait(150);
    let delay = 45;
    let prev = "";
    while (delay < 280) {
        let name = prev;
        while (name === prev) name = pool[Math.floor(Math.random() * pool.length)].name;
        prev = name;
        const el = document.getElementById("hero-name");
        if (el) el.textContent = name;
        await wait(delay);
        delay *= 1.14;
    }
    const el = document.getElementById("hero-name");
    if (el) el.textContent = chosen.name;
}

async function pick() {
    const cls = currentClass();
    if (!cls || picking) return;
    const pool = availableIn(cls);
    if (!pool.length) {
        const anyPresent = cls.students.some(s => s.status === "present");
        toast(t(anyPresent ? "pick.everyoneHadTurn" : "pick.nobodyPresent"), anyPresent ? { action: { label: t("round.new"), run: () => resetRound(cls) } } : {});
        return;
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    picking = true;
    renderMainPanel();
    await shuffleAnimation(pool, chosen);
    picking = false;
    // The class/student may have changed (deleted, undo) while the animation ran.
    if (!currentClass()?.students.includes(chosen)) return renderAll();
    chosen.hasParticipatedThisRound = true;
    chosen.participationCount++;
    data.logs.push({ type: "participation", classId: cls.id, studentId: chosen.id, ts: nowISO() });
    lastPick = { classId: cls.id, studentId: chosen.id };
    celebrate = true;
    persist();
    burstConfetti();
}

function resetRound(cls: ClassItem) {
    undoable(t("round.resetDone"), () => {
        cls.students.forEach(s => s.hasParticipatedThisRound = false);
        if (lastPick?.classId === cls.id) lastPick = null;
    });
}

function burstConfetti() {
    if (reducedMotion.matches) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const layer = h("div", { class: "confetti" });
    const colors = ["#7dd3fc", "#38bdf8", "#a5f3fc", "#e0f2fe", "#0ea5e9", "#34d399"];
    for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 180;
        const piece = h("span");
        piece.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
        piece.style.setProperty("--y", `${Math.sin(angle) * dist * 0.6 - 40}px`);
        piece.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
        piece.style.setProperty("--c", colors[i % colors.length]);
        piece.style.animationDelay = `${Math.random() * 80}ms`;
        layer.append(piece);
    }
    hero.append(layer);
    setTimeout(() => layer.remove(), 1400);
}

/* ========== Import / export ========== */

function exportAll() {
    downloadFile(`student-picker-${today()}.json`, JSON.stringify(allPayload(data), null, 2));
    toast(t("backup.downloaded"), { tone: "success" });
}

function describeIncoming(inc: Incoming | null): string {
    if (!inc) return t("detect.none");
    const target = currentClass()?.name ?? t("detect.chooseClass");
    const totalStudents = (classes: ClassItem[]) => count("count.students", classes.reduce((n, c) => n + c.students.length, 0));
    switch (inc.kind) {
        case "all":
            return t("detect.all", { classes: count("count.classes", inc.data.classes.length), students: totalStudents(inc.data.classes) });
        case "classes":
            return t("detect.classes", { classes: count("count.classes", inc.classes.length), students: totalStudents(inc.classes) });
        case "students":
            return t("detect.students", { students: count("count.students", inc.students.length), target });
        case "names":
            return t("detect.names", { students: count("count.newStudents", inc.names.length), target });
    }
}

function addClasses(classes: ClassItem[]) {
    const taken = data.classes.map(c => c.name);
    const copies = classes.map(c => {
        const copy = cloneClass(c);
        copy.name = uniqueName(c.name, taken);
        taken.push(copy.name);
        return copy;
    });
    data.classes.push(...copies);
    if (copies[0]) currentClassId = copies[0].id;
}

async function applyIncoming(inc: Incoming) {
    switch (inc.kind) {
        case "all": {
            let mode: "replace" | "merge" | "" = "replace";
            if (data.classes.length) {
                mode = await modal<"replace" | "merge" | "">({
                    title: t("import.backupTitle"),
                    description: t("import.backupDesc", { classes: count("count.classes", inc.data.classes.length) }),
                    actions: [
                        { label: t("common.cancel"), value: "", variant: "ghost" },
                        { label: t("import.replaceAll"), value: "replace", variant: "danger" },
                        { label: t("import.addAsNew"), value: "merge", variant: "primary", submit: true },
                    ],
                }) ?? "";
            }
            if (!mode) return;
            undoable(mode === "replace" ? t("import.restored") : t("import.importedClasses", { classes: count("count.classes", inc.data.classes.length) }), () => {
                if (mode === "replace") {
                    data = inc.data;
                    currentClassId = data.classes[0]?.id ?? null;
                    lastPick = null;
                } else addClasses(inc.data.classes);
            });
            return;
        }
        case "classes":
            undoable(t("import.importedClasses", { classes: count("count.classes", inc.classes.length) }), () => addClasses(inc.classes));
            return;
        case "students":
        case "names": {
            const target = currentClass() ?? await chooseClass(t("import.addStudentsTo"));
            if (!target) return;
            const students = inc.kind === "names" ? inc.names.map(newStudent) : inc.students.map(s => cloneStudent(s));
            undoable(t("import.addedTo", { students: count("count.students", students.length), target: target.name }), () => {
                target.students.push(...students);
                currentClassId = target.id;
            });
        }
    }
}

async function importFile(file: File) {
    try {
        const inc = parseIncoming(await readFileText(file));
        if (!inc) throw new Error("unrecognised");
        await applyIncoming(inc);
    } catch {
        toast(t("import.failed", { file: file.name }), { tone: "error" });
    }
}

async function openPasteDialog(prefill = "") {
    const area = h("textarea", {
        class: "input textarea mono",
        rows: 9,
        value: prefill,
        placeholder: t("paste.placeholder"),
    });
    const hint = h("p", { class: "detect" });
    const update = () => {
        const inc = parseIncoming(area.value);
        hint.classList.toggle("ok", !!inc);
        hint.replaceChildren(icon(inc ? "check" : "info"), describeIncoming(inc));
    };
    area.oninput = update;
    update();
    const ok = await modal({
        title: t("paste.title"),
        description: t("paste.desc"),
        body: h("div", { class: "stack" }, area, hint),
        actions: [cancelAction(), { label: t("common.import"), value: true, variant: "primary", submit: true }],
        init: () => area.focus(),
    });
    if (!ok) return;
    const inc = parseIncoming(area.value);
    if (!inc) return toast(t("paste.nothing"), { tone: "error" });
    await applyIncoming(inc);
}

/* ========== Theme ========== */

function readTheme(): "dark" | "light" {
    try {
        return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch { /* ignore */ }
    renderControlsPanel();
}

/* ========== Language ========== */

function changeLang(next: Lang) {
    if (next === getLang()) return;
    setLang(next);
    renderAll();
}

/** Static parts of index.html that also need translating. */
function renderChrome() {
    document.title = t("app.name");
    document.getElementById("brandName")!.textContent = t("app.name");
    document.getElementById("brandTagline")!.textContent = t("app.tagline");
    classesPanel.setAttribute("aria-label", t("classes.title"));
    studentsPanel.setAttribute("aria-label", t("students.title"));
}

/* ========== Rendering ========== */

function renderAll() {
    const scroll = new Map<string, number>();
    document.querySelectorAll<HTMLElement>("[data-scroll]").forEach(el => scroll.set(el.dataset.scroll!, el.scrollTop));
    const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.focusKey;

    renderChrome();
    renderControlsPanel();
    renderClassesPanel();
    renderStudentsPanel();
    renderMainPanel();

    document.querySelectorAll<HTMLElement>("[data-scroll]").forEach(el => {
        el.scrollTop = scroll.get(el.dataset.scroll!) ?? 0;
    });
    if (focusKey) document.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
}

function renderControlsPanel() {
    const fileInput: HTMLInputElement = h("input", {
        type: "file",
        accept: ".json,.csv,.txt,application/json,text/csv,text/plain",
        hidden: true,
        onchange: () => {
            const f = fileInput.files?.[0];
            if (f) importFile(f);
            fileInput.value = "";
        },
    });
    controlsPanel.replaceChildren(
        button([icon("paste"), h("span", { class: "btn-text" }, t("header.paste"))], () => openPasteDialog(), "btn btn-ghost", { title: t("header.pasteTitle") }),
        button([icon("upload"), h("span", { class: "btn-text" }, t("header.import"))], () => fileInput.click(), "btn btn-ghost", { title: t("header.importTitle") }),
        button([icon("download"), h("span", { class: "btn-text" }, t("header.backup"))], exportAll, "btn btn-soft", { title: t("header.backupTitle") }),
        h("span", { class: "divider" }),
        h("div", { class: "segmented lang-switch", role: "radiogroup", "aria-label": t("header.language") },
            (Object.keys(LANGUAGE_NAMES) as Lang[]).map(code => h("button", {
                type: "button",
                role: "radio",
                class: `seg${code === getLang() ? " on" : ""}`,
                "aria-checked": String(code === getLang()),
                title: LANGUAGE_NAMES[code].name,
                lang: code,
                onclick: () => changeLang(code),
            }, LANGUAGE_NAMES[code].short)),
        ),
        iconBtn(theme === "dark" ? "sun" : "moon", t(theme === "dark" ? "header.lightMode" : "header.darkMode"), toggleTheme),
        fileInput,
    );
}

function renderClassesPanel() {
    const list = data.classes.map(c => {
        const present = c.students.filter(s => s.status === "present").length;
        const active = c.id === currentClassId;
        return h("div", {
                class: `class-item${active ? " active" : ""}`,
                role: "button",
                tabindex: 0,
                "aria-current": active ? "true" : null,
                onclick: () => selectClass(c.id),
                onkeydown: (e: KeyboardEvent) => {
                    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        selectClass(c.id);
                    }
                },
            },
            avatar(c.name),
            h("span", { class: "class-meta" },
                h("span", { class: "class-name" }, c.name),
                h("span", { class: "class-sub" }, t("classes.sub", { students: count("count.students", c.students.length), present })),
            ),
            menuBtn(t("classes.options", { name: c.name }), () => classMenu(c)),
        );
    });

    classesPanel.replaceChildren(
        h("div", { class: "panel-head" },
            h("div", { class: "panel-title" }, h("h2", null, t("classes.title")), h("span", { class: "count" }, data.classes.length)),
            iconBtn("plus", t("classes.new"), createClass, "icon-btn-accent"),
        ),
        h("div", { class: "panel-body", "data-scroll": "classes" },
            list.length ? h("div", { class: "class-list" }, list)
                : emptyState("book", t("classes.emptyTitle"), t("classes.emptyText"),
                    button([icon("plus"), t("classes.new")], createClass, "btn btn-primary btn-sm")),
        ),
    );
}

function renderStudentsPanel() {
    const cls = currentClass();
    if (!cls) {
        studentsPanel.replaceChildren(
            h("div", { class: "panel-head" }, h("div", { class: "panel-title" }, h("h2", null, t("students.title")))),
            h("div", { class: "panel-body" }, emptyState("users", t("students.noClassTitle"), t("students.noClassText"))),
        );
        return;
    }
    // Drop selections that no longer exist.
    for (const id of selected) if (!cls.students.some(s => s.id === id)) selected.delete(id);

    const head = h("div", { class: "panel-head" },
        h("div", { class: "panel-title" }, h("h2", null, t("students.title")), h("span", { class: "count" }, cls.students.length)),
        h("div", { class: "panel-actions" },
            iconBtn("select", t(selectMode ? "students.doneSelecting" : "students.selectMultiple"), () => {
                selectMode = !selectMode;
                selected.clear();
                renderStudentsPanel();
            }, selectMode ? "on" : "", { disabled: !cls.students.length }),
            menuBtn(t("students.classActions"), () => [
                { label: t("students.markAllPresent"), icon: "check", run: () => setStatus(cls.students, "present") },
                { label: t("students.markAllAbsent"), icon: "x", run: () => setStatus(cls.students, "absent") },
                { label: t("students.markAllSkipped"), icon: "minus", run: () => setStatus(cls.students, "skipped") },
                "sep",
                { label: t("round.new"), icon: "reset", run: () => resetRound(cls) },
                { label: t("students.copyAllTo"), icon: "copy", run: () => transferStudents(cls, cls.students, "copy"), disabled: !cls.students.length },
                { label: t("students.exportClass"), icon: "download", run: () => exportClassJson(cls) },
            ]),
            iconBtn("plus", t("students.add"), () => addStudents(cls), "icon-btn-accent"),
        ),
    );

    const search = h("label", { class: "search" },
        icon("search"),
        h("input", {
            class: "input input-sm",
            type: "search",
            placeholder: t("students.search"),
            value: studentQuery,
            "data-focus-key": "student-search",
            oninput: (e: Event) => {
                studentQuery = (e.target as HTMLInputElement).value;
                renderStudentList(cls);
            },
        }),
    );

    studentsPanel.replaceChildren(
        head,
        ...[
            cls.students.length ? h("div", { class: "panel-toolbar" }, search) : null,
            selectMode ? bulkBar(cls) : null,
        ].filter(el => el != null),
        h("div", { class: "panel-body", id: "studentList", "data-scroll": "students" }),
    );
    renderStudentList(cls);
}

function bulkBar(cls: ClassItem) {
    const chosen = cls.students.filter(s => selected.has(s.id));
    const none = chosen.length === 0;
    const allSelected = chosen.length === cls.students.length;
    const act = (name: IconName, label: string, run: () => void, cls = "") => iconBtn(name, label, run, cls, { disabled: none });
    const markKeys = { present: "bulk.markPresent", absent: "bulk.markAbsent", skipped: "bulk.markSkipped" } as const;
    const statusBtn: HTMLButtonElement = iconBtn("check", t("bulk.setAttendance"), () => openMenu(statusBtn,
        STATUSES.map(st => ({ label: t(markKeys[st]), run: () => setStatus(chosen, st) }))), "", { disabled: none });
    return h("div", { class: "bulk-bar" },
        h("div", { class: "bulk-info" },
            h("strong", null, t("bulk.selected", { n: chosen.length })),
            button(t(allSelected ? "bulk.clear" : "bulk.selectAll"), () => {
                if (allSelected) selected.clear();
                else cls.students.forEach(s => selected.add(s.id));
                renderStudentsPanel();
            }, "btn btn-link"),
        ),
        h("div", { class: "bulk-actions" },
            statusBtn,
            act("duplicate", t("common.duplicate"), () => duplicateStudents(cls, chosen)),
            act("copy", t("students.copyToClass"), () => transferStudents(cls, chosen, "copy")),
            act("move", t("students.moveToClass"), () => transferStudents(cls, chosen, "move")),
            act("code", t("bulk.copyToClipboard"), () => copyStudents(chosen)),
            act("download", t("students.exportJson"), () => exportStudents(cls, chosen)),
            act("trash", t("common.delete"), () => deleteStudents(cls, chosen), "danger"),
        ),
    );
}

function renderStudentList(cls: ClassItem) {
    const listEl = document.getElementById("studentList");
    if (!listEl) return;
    if (!cls.students.length) {
        listEl.replaceChildren(emptyState("users", t("students.emptyTitle"), t("students.emptyText"),
            button([icon("plus"), t("students.add")], () => addStudents(cls), "btn btn-primary btn-sm"),
            button([icon("paste"), t("header.paste")], () => openPasteDialog(), "btn btn-soft btn-sm")));
        return;
    }
    const q = studentQuery.trim().toLocaleLowerCase(getLang());
    const students = [...cls.students].sort(byName).filter(s => !q || s.name.toLocaleLowerCase(getLang()).includes(q));
    if (!students.length) {
        listEl.replaceChildren(h("p", { class: "muted center" }, t("students.noMatch", { query: studentQuery })));
        return;
    }
    listEl.replaceChildren(h("div", { class: "student-list" }, students.map(s => studentCard(cls, s))));
}

function studentCard(cls: ClassItem, s: Student) {
    const isSelected = selected.has(s.id);
    const toggle = () => {
        if (isSelected) selected.delete(s.id);
        else selected.add(s.id);
        renderStudentsPanel();
    };
    const stop = (fn: () => void) => (e: Event) => {
        e.stopPropagation();
        fn();
    };
    const isPick = lastPick?.studentId === s.id;
    return h("div", {
            class: `student-card status-${s.status}${s.hasParticipatedThisRound ? " picked" : ""}${isSelected ? " selected" : ""}${isPick ? " current" : ""}${selectMode ? " selectable" : ""}`,
            onclick: selectMode ? toggle : null,
        },
        h("div", { class: "sc-top" },
            selectMode ? h("input", { type: "checkbox", class: "checkbox", checked: isSelected, "aria-label": t("students.select", { name: s.name }), onclick: stop(toggle) }) : null,
            h("div", { class: "sc-name-wrap" },
                h("span", { class: "sc-name", title: s.name }, s.name),
                h("span", { class: "sc-sub" },
                    count("count.turns", s.participationCount),
                    s.hasParticipatedThisRound ? h("span", { class: "badge badge-picked" }, icon("check"), t("students.picked")) : null,
                ),
            ),
            selectMode ? null : menuBtn(t("students.options", { name: s.name }), () => studentMenu(cls, s)),
        ),
        h("div", { class: "sc-bottom" },
            h("div", { class: "segmented", role: "radiogroup", "aria-label": t("students.attendanceFor", { name: s.name }) },
                STATUSES.map(st => h("button", {
                    type: "button",
                    role: "radio",
                    class: `seg seg-${st}${s.status === st ? " on" : ""}`,
                    "aria-checked": String(s.status === st),
                    onclick: stop(() => setStatus([s], st)),
                }, t(`status.${st}` as const))),
            ),
            h("div", { class: "score-ctl" },
                iconBtn("minus", t("students.minusPoint", { name: s.name }), stop(() => adjustScore(cls, s, -1)), "score-btn minus"),
                h("span", { class: `score-val${s.score > 0 ? " pos" : s.score < 0 ? " neg" : ""}` }, fmtScore(s.score)),
                iconBtn("plus", t("students.plusPoint", { name: s.name }), stop(() => adjustScore(cls, s, 1)), "score-btn plus"),
            ),
        ),
    );
}

function renderMainPanel() {
    const cls = currentClass();
    if (!cls) {
        mainPanel.replaceChildren(h("div", { class: "welcome" },
            h("span", { class: "welcome-mark" }, icon("sparkle")),
            h("h1", null, t("welcome.title")),
            h("p", null, t("welcome.text")),
            h("div", { class: "empty-actions" },
                button([icon("plus"), t("welcome.create")], createClass, "btn btn-primary btn-lg"),
                button([icon("paste"), t("welcome.paste")], () => openPasteDialog(), "btn btn-soft btn-lg"),
            ),
        ));
        return;
    }

    const present = cls.students.filter(s => s.status === "present");
    const pool = availableIn(cls);
    const done = present.filter(s => s.hasParticipatedThisRound).length;
    const picked = lastPick?.classId === cls.id ? cls.students.find(s => s.id === lastPick!.studentId) ?? null : null;
    const roundOver = present.length > 0 && pool.length === 0;

    const label = t(picking ? "hero.picking" : picked ? "hero.yourTurn" : !cls.students.length ? "hero.noStudents" : roundOver ? "hero.roundComplete" : "hero.ready");

    const hero = h("div", { class: `hero${picked && !picking ? " has-pick" : ""}${celebrate ? " celebrate" : ""}${picking ? " shuffling" : ""}` },
        h("span", { class: "hero-label" }, label),
        h("div", { class: "hero-name", id: "hero-name" }, picked && !picking ? picked.name : picking ? "…" : t(roundOver ? "hero.everyoneHadTurn" : "hero.whosNext")),
        picked && !picking
            ? h("div", { class: "hero-score" },
                button([icon("minus"), "1"], () => adjustScore(cls, picked, -1), "btn btn-soft score-pill minus"),
                h("span", { class: `hero-score-val${picked.score > 0 ? " pos" : picked.score < 0 ? " neg" : ""}` }, fmtScore(picked.score), h("small", null, t("hero.points"))),
                button([icon("plus"), "1"], () => adjustScore(cls, picked, 1), "btn btn-soft score-pill plus"),
            )
            : h("p", { class: "hero-hint" },
                !cls.students.length ? t("hero.addStudentsHint")
                    : roundOver ? t("hero.newRoundHint")
                        : tRich("hero.pickHint", { pick: h("strong", null, t("hero.pickWord")), key: h("kbd", null, t("hero.spaceKey")) })),
    );
    celebrate = false;

    const actions = h("div", { class: "stage-actions" },
        roundOver
            ? button([icon("reset"), t("round.start")], () => resetRound(cls), "btn btn-primary btn-xl")
            : button([icon("shuffle"), t("pick.button")], pick, "btn btn-primary btn-xl pick-btn", { disabled: picking || !pool.length }),
        !roundOver && done > 0 ? button([icon("reset"), t("round.new")], () => resetRound(cls), "btn btn-soft btn-xl") : null,
    );

    const pct = present.length ? Math.round(done / present.length * 100) : 0;
    const progress = h("div", { class: "round" },
        h("div", { class: "round-stats" },
            stat(present.length, t("stats.present"), t("stats.of", { n: cls.students.length })),
            stat(pool.length, t("stats.waiting")),
            stat(done, t("stats.picked")),
        ),
        h("div", { class: "progress", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 },
            h("span", { style: `width:${pct}%` })),
    );

    const ranked = [...cls.students].sort((a, b) => b.score - a.score || byName(a, b));
    const board = h("div", { class: "board" },
        h("div", { class: "board-head" }, icon("trophy"), h("h3", null, t("board.title")), h("span", { class: "muted" }, t("board.legend"))),
        ranked.length
            ? h("ol", { class: "board-list" }, ranked.map(s => {
                const rank = 1 + ranked.filter(x => x.score > s.score).length;
                const state = s.hasParticipatedThisRound ? "picked" : s.status;
                return h("li", { class: `board-row state-${state}${picked === s ? " current" : ""}` },
                    h("span", { class: `rank${rank <= 3 && s.score > 0 ? ` r${rank}` : ""}` }, rank),
                    h("span", { class: "board-name" }, s.name),
                    h("span", { class: `dot dot-${state}`, title: state === "picked" ? t("board.pickedThisRound") : t(`status.${s.status}` as const) }),
                    h("span", { class: "board-turns" }, s.participationCount),
                    h("span", { class: `board-score${s.score > 0 ? " pos" : s.score < 0 ? " neg" : ""}` }, fmtScore(s.score)),
                );
            }))
            : h("p", { class: "muted center" }, t("board.empty")),
    );

    mainPanel.replaceChildren(h("div", { class: "stage-inner", "data-scroll": "stage" },
        h("div", { class: "stage-head" },
            h("div", null, h("span", { class: "eyebrow" }, t("stage.currentClass")), h("h1", { class: "stage-title" }, cls.name)),
            menuBtn(t("classes.options", { name: cls.name }), () => classMenu(cls)),
        ),
        hero,
        actions,
        progress,
        board,
    ));
}

function stat(value: number, label: string, sub?: string) {
    return h("div", { class: "stat" }, h("strong", null, value), h("span", null, label, sub ? h("small", null, ` ${sub}`) : null));
}

/* ========== Global input ========== */

function isTyping(t: EventTarget | null) {
    return t instanceof HTMLElement && !!t.closest("input, textarea, select, [contenteditable]");
}

document.addEventListener("keydown", e => {
    if (document.querySelector("dialog[open]") || document.querySelector(".menu")) return;
    if (e.key === "Escape" && selectMode) {
        selectMode = false;
        selected.clear();
        return renderStudentsPanel();
    }
    if (isTyping(e.target) || (e.target as HTMLElement).closest?.("button, [role=button]")) return;
    if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        pick();
    }
});

document.addEventListener("paste", e => {
    if (document.querySelector("dialog[open]") || isTyping(e.target)) return;
    const text = e.clipboardData?.getData("text/plain") ?? "";
    if (!text.trim()) return;
    e.preventDefault();
    openPasteDialog(text);
});

let dragDepth = 0;
window.addEventListener("dragenter", e => {
    if (!e.dataTransfer?.types.includes("Files")) return;
    dragDepth++;
    document.body.classList.add("dragging");
});
window.addEventListener("dragleave", () => {
    if (--dragDepth <= 0) {
        dragDepth = 0;
        document.body.classList.remove("dragging");
    }
});
window.addEventListener("dragover", e => e.preventDefault());
window.addEventListener("drop", e => {
    e.preventDefault();
    dragDepth = 0;
    document.body.classList.remove("dragging");
    const file = e.dataTransfer?.files[0];
    if (file) importFile(file);
});

/* ========== bootstrap ========== */
document.documentElement.dataset.theme = theme;
document.documentElement.lang = getLang();
renderAll();
Object.defineProperty(window, "appData", { get: () => data }); // for debugging in console
