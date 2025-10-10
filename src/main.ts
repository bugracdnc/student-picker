// src/main.ts
import type { AppData, ClassItem, Status, Student } from "./models";
import { exportDataFile, importDataFile, loadData, saveData } from "./storage";

/*const app = document.getElementById("app")!;*/
const classesPanel = document.getElementById("classesPanel")!;
const studentsPanel = document.getElementById("studentsPanel")!;
const mainPanel = document.getElementById("mainPanel")!;
const controlsPanel = document.getElementById("controlsPanel")!;

let data: AppData = loadData();
let currentClassId: string | null = data.classes.length ? data.classes[0].id : null;

// small helper
function uid() {
    return (crypto as any).randomUUID?.() ?? ("id-" + Math.random().toString(36).slice(2, 9));
}

function nowISO() {
    return new Date().toISOString();
}

function persist() {
    saveData(data);
    renderAll();
}

/* ========== Core actions ========== */

function addClass(name: string) {
    const c: ClassItem = { id: uid(), name, students: [] };
    data.classes.push(c);
    currentClassId = c.id;
    persist();
}

function removeClass(classId: string) {
    data.classes = data.classes.filter(c => c.id !== classId);
    if (currentClassId === classId) currentClassId = data.classes[0]?.id ?? null;
    persist();
}

function addStudentToCurrent(name: string) {
    if (!currentClassId) return alert("Select or create a class first.");
    const cls = data.classes.find(c => c.id === currentClassId)!;
    const s: Student = {
        id: uid(),
        name: name.trim(),
        status: "present",
        participationCount: 0,
        score: 0,
        hasParticipatedThisRound: false
    };
    cls.students.push(s);
    persist();
}

function removeStudent(classId: string, studentId: string) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    cls.students = cls.students.filter(s => s.id !== studentId);
    persist();
}

function setStatus(classId: string, studentId: string, status: Status) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    const s = cls.students.find(x => x.id === studentId);
    if (!s) return;
    s.status = status;
    persist();
}

function pickRandomFromCurrent(): Student | null {
    if (!currentClassId) return null;
    const cls = data.classes.find(c => c.id === currentClassId)!;
    const available = cls.students.filter(s => s.status === "present" && !s.hasParticipatedThisRound);
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    const chosen = available[idx];
    chosen.hasParticipatedThisRound = true;
    chosen.participationCount++;
    data.logs.push({ type: "participation", classId: cls.id, studentId: chosen.id, ts: nowISO() });
    persist();
    return chosen;
}

function updateScore(classId: string, studentId: string, delta: number) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    const s = cls.students.find(x => x.id === studentId);
    if (!s) return;
    s.score += delta;
    data.logs.push({ type: "score", classId: cls.id, studentId: s.id, delta, ts: nowISO() });
    persist();
}

function markPresent(classId: string) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    cls.students.forEach(s => s.status = "present" as Status);
    persist();
}

function markAbsent(classId: string) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    cls.students.forEach(s => s.status = "absent" as Status);
    persist();
}

function markSkipped(classId: string) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    cls.students.forEach(s => s.status = "skipped" as Status);
    persist();
}

function resetRound(classId: string) {
    const cls = data.classes.find(c => c.id === classId);
    if (!cls) return;
    cls.students.forEach(s => s.hasParticipatedThisRound = false);
    persist();
}

/* ========== Export / Import ========== */

function doExport() {
    exportDataFile(data);
}

async function doImport(file: File) {
    try {
        const imported = await importDataFile(file);
        // Basic validation
        if (!imported || !Array.isArray(imported.classes)) throw new Error("Bad file");
        data = imported as AppData;
        // keep currentClass sensible
        currentClassId = data.classes[0]?.id ?? null;
        persist();
        alert("Import complete.");
    } catch (e) {
        alert("Import failed: " + String(e));
    }
}

/* ========== Admin logs (simple password) ==========
const ADMIN_KEY = "student-picker-admin-pw";

/*function setAdminPassword() {
    const pw = prompt("Set admin password (will be stored locally):");
    if (!pw) return alert("No password set.");
    localStorage.setItem(ADMIN_KEY, pw);
    alert("Password saved.");
}*/

/*function openAdminLogs() {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (!stored) {
        if (!confirm("No admin password set — set one now?")) return;
        setAdminPassword();
        return;
    }
    const attempt = prompt("Enter admin password:");
    if (attempt !== stored) return alert("Wrong password.");
    // show logs in simple window
    const lines = data.logs.slice().reverse().map(l => {
        return `${l.ts} — ${l.type} — class:${l.classId} student:${l.studentId} ${l.delta ?? ""}`;
    }).join("\n");
    const w = window.open("", "_blank", "width=700,height=600");
    if (!w) return alert("Popup blocked.");
    w.document.title = "Student Picker — Logs";
    w.document.body.innerHTML = `<pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(lines || "No logs")}</pre>`;
}*/

function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/* ========== Rendering ========== */

function renderAll() {
    renderClassesPanel();
    renderStudentsPanel();
    renderMainPanel();
    renderControlsPanel();
}

function renderClassesPanel() {
    classesPanel.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = "Classes";
    classesPanel.appendChild(h);

    const ul = document.createElement("ul");
    data.classes.forEach(c => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        const btn = document.createElement("button");
        btn.textContent = (currentClassId === c.id ? "• " : "") + c.name;
        btn.onclick = () => {
            currentClassId = c.id;
            renderAll();
        };
        li.appendChild(btn);
        const del = document.createElement("button");
        del.textContent = "✕";
        del.title = "Delete class";
        del.style.marginLeft = "8px";
        del.style.color = "#F00";
        del.onclick = () => {
            if (confirm(`Delete class "${c.name}"?`)) removeClass(c.id);
        };
        li.appendChild(del);
        ul.appendChild(li);
    });
    classesPanel.appendChild(ul);

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add class";
    addBtn.onclick = () => {
        const name = prompt("Class name:");
        if (!name) return;
        addClass(name);
    };
    classesPanel.appendChild(addBtn);
}

function renderStudentsPanel() {
    studentsPanel.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "Students";
    studentsPanel.appendChild(title);
    const markAllPresent = document.createElement("button");
    const markAllAbsent = document.createElement("button");
    const markAllSkipped = document.createElement("button");
    markAllPresent.textContent = "Mark All Present";
    markAllPresent.onclick = () => markPresent(cls.id);
    markAllAbsent.textContent = "Mark All Absent";
    markAllAbsent.onclick = () => markAbsent(cls.id);
    markAllSkipped.textContent = "Mark All Skipped";
    markAllSkipped.onclick = () => markSkipped(cls.id);
    studentsPanel.appendChild(markAllPresent);
    studentsPanel.appendChild(markAllAbsent);
    studentsPanel.appendChild(markAllSkipped);
    if (!currentClassId) {
        studentsPanel.appendChild(document.createTextNode("No class selected"));
        return;
    }
    const cls = data.classes.find(c => c.id === currentClassId)!
    cls.students = cls.students.sort((s1, s2) => Number(s1.name.substring(0, 3)) - Number(s2.name.substring(0, 3)));

    const list = document.createElement("ul");
    cls.students.forEach(s => {
        const li = document.createElement("li");
        li.className = "student-row";
        li.innerHTML = `<span class="student-name">${escapeHtml(s.name)}</span>`;
        // status select
        const sel = document.createElement("select");
        ["present", "absent", "skipped"].forEach(st => {
            const o = document.createElement("option");
            o.value = st;
            o.textContent = st;
            if (s.status === st) o.selected = true;
            sel.appendChild(o);
        });
        sel.onchange = () => setStatus(cls.id, s.id, sel.value as Status);
        li.appendChild(document.createTextNode(" "));
        li.appendChild(sel);
        li.appendChild(document.createTextNode(`${s.score}/${s.participationCount}`))

        // + / - score
        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.onclick = () => updateScore(cls.id, s.id, 1);
        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.onclick = () => updateScore(cls.id, s.id, -1);
        li.appendChild(document.createTextNode(" "));
        li.appendChild(plus);
        li.appendChild(minus);

        // delete student
        const del = document.createElement("button");
        del.textContent = "✕";
        del.style.marginLeft = "8px";
        del.style.color = "#F00";
        del.onclick = () => {
            if (confirm(`Delete "${s.name}"?`)) removeStudent(cls.id, s.id);
        };
        li.appendChild(del);

        list.appendChild(li);
    });
    studentsPanel.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add student";
    addBtn.onclick = () => {
        const name = prompt("Student name:");
        if (!name) return;
        addStudentToCurrent(name);
    };
    studentsPanel.appendChild(addBtn);
}

function renderMainPanel() {
    mainPanel.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = "Random Picker";
    mainPanel.appendChild(h);

    if (!currentClassId) {
        mainPanel.appendChild(document.createTextNode("Select a class."));
        return;
    }
    const cls = data.classes.find(c => c.id === currentClassId)!;

    // available list
    const avail = cls.students.filter(s => s.status === "present" && !s.hasParticipatedThisRound);
    avail.sort((a, b) => b.score - a.score);

    const pickLbl = document.getElementById("picked-student");
    const pickBtn = document.createElement("button");
    pickBtn.textContent = avail.length ? `Pick random (${avail.length} available)` : "No available students";
    pickBtn.disabled = avail.length === 0;
    pickBtn.onclick = () => {
        const chosen = pickRandomFromCurrent();
        if (chosen) {
            pickLbl!.innerText = chosen.name;
        } else {
            alert("No one available to pick.");
        }
    };
    mainPanel.appendChild(pickBtn);

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset round";
    resetBtn.style.marginLeft = "8px";
    resetBtn.onclick = () => {
        if (!confirm("Clear this round (mark everyone as not participated)?")) return;
        pickLbl!.innerText = "";
        resetRound(cls.id);
    };
    mainPanel.appendChild(resetBtn);

    // Available column
    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.gap = "24px";
    col.style.marginTop = "12px";

    // Scoreboard (sorted)
    const scoreboard = document.createElement("div");
    scoreboard.innerHTML = `<h4>Scoreboard</h4>`;
    const sorted = [...cls.students].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    sorted.forEach(s => {
        const r = document.createElement("div");
        r.style.marginBottom = "8px";
        if (s.hasParticipatedThisRound) r.style.color = "#2878e0";
        else if (s.status.toString() === "absent") r.style.color = "#ccc";
        else if (s.status.toString() === "skipped") r.style.color = "#cf3232";
        else r.style.color = "#179123";
        r.innerHTML = ` • ${escapeHtml(s.name)} — ${s.score}/${s.participationCount}`;
        scoreboard.appendChild(r);
    });

    col.appendChild(scoreboard);
    mainPanel.appendChild(col);
}

function renderControlsPanel() {
    controlsPanel.innerHTML = "";
    const label = document.createElement("h2");
    label.innerText = "test";
    const exp = document.createElement("button");
    exp.textContent = "Export JSON";
    exp.onclick = doExport;
    const imp = document.createElement("input");
    imp.type = "file";
    imp.accept = "application/json";
    imp.onchange = (e) => {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (!f) return;
        doImport(f);
    };
    //const setPw = document.createElement("button"); setPw.textContent = "Set Admin Password"; setPw.onclick = setAdminPassword;
    //const logs = document.createElement("button"); logs.textContent = "Open Admin Logs"; logs.onclick = openAdminLogs;
    controlsPanel.appendChild(exp);
    controlsPanel.appendChild(document.createTextNode(" "));
    controlsPanel.appendChild(imp);
    controlsPanel.appendChild(document.createElement("br"));
    //controlsPanel.appendChild(setPw); controlsPanel.appendChild(document.createTextNode(" "));
    //controlsPanel.appendChild(logs);
}

/* ========== bootstrap ========== */
renderAll();
(window as any).appData = data; // for debugging in console
