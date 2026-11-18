// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
// Self-check for import detection. Run: npm test
import assert from "node:assert/strict";
import { cleanName, newStudent, parseIncoming, splitNames, studentsPayload, classPayload, allPayload } from "../src/transfer";

const names = (text: string) => {
    const inc = parseIncoming(text);
    if (!inc) return null;
    if (inc.kind === "names") return inc.names;
    if (inc.kind === "students") return inc.students.map(s => s.name);
    if (inc.kind === "classes") return inc.classes.flatMap(c => c.students.map(s => s.name));
    return inc.data.classes.flatMap(c => c.students.map(s => s.name));
};
const ali = { ...newStudent("Ali Yılmaz"), score: 3 };
const ayse = newStudent("Ayşe Kaya");

// Own formats first: a copied student must never become one "student" per JSON line.
const one = parseIncoming(JSON.stringify(studentsPayload([ali]), null, 2));
assert.equal(one?.kind, "students");
assert.deepEqual(one.kind === "students" && one.students.map(s => [s.name, s.score]), [["Ali Yılmaz", 3]]);
assert.equal(parseIncoming(JSON.stringify(classPayload({ id: "c", name: "9-A", students: [ali, ayse] }), null, 2))?.kind, "classes");
assert.equal(parseIncoming(JSON.stringify(allPayload({ classes: [], logs: [] })))?.kind, "all");

// Two copied students pasted one after another.
const two = JSON.stringify(studentsPayload([ali]), null, 2) + "\n" + JSON.stringify(studentsPayload([ayse]), null, 2);
assert.deepEqual(names(two), ["Ali Yılmaz", "Ayşe Kaya"]);

// Broken JSON is rejected, not split into lines.
assert.equal(parseIncoming('{\n  "app": "student-picker",\n  "students": [\n'), null);

// Other JSON.
assert.deepEqual(names('["Ali", " Ayşe "]'), ["Ali", "Ayşe"]);
assert.deepEqual(names('[{"name":"Can"}]'), ["Can"]);

// Own CSV export, comma or Turkish-Excel semicolon.
assert.deepEqual(names("Ad,Durum,Puan\nAli,Var,2\nAyşe,Yok,0"), ["Ali", "Ayşe"]);
assert.deepEqual(names("Name;Score\nAli;2\n\"Kaya; Ayşe\";1"), ["Ali", "Kaya; Ayşe"]);

// Spreadsheet / e-Okul style: title row, tabs, separate first/last name columns.
assert.deepEqual(names("9-A Sınıf Listesi\nS.No\tÖğrenci No\tAdı\tSoyadı\n1\t123\tAli\tYılmaz\n2\t456\tAyşe\tKaya"), ["Ali Yılmaz", "Ayşe Kaya"]);
assert.deepEqual(names("Ad Soyad\nAli Yılmaz\nAyşe Kaya"), ["Ali Yılmaz", "Ayşe Kaya"]);

// Plain lists.
assert.deepEqual(splitNames("1. Ali\n2) Ayşe\n- Can\n• Deniz\n\"Ece\",\n\tFatma\tNur"), ["Ali", "Ayşe", "Can", "Deniz", "Ece", "Fatma Nur"]);
assert.deepEqual(splitNames("Ali, Ayşe; Can"), ["Ali", "Ayşe", "Can"]);
assert.deepEqual(splitNames("9-A Ali"), ["9-A Ali"]);

// Name cleanup.
assert.equal(cleanName("  Ali​   Yılmaz‮ "), "Ali Yılmaz");
assert.equal(cleanName("x".repeat(500)).length, 100);

console.log("transfer checks passed");
