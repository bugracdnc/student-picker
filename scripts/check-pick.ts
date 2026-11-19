// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
// Self-check for the fairness rule. Run: npm test
import assert from "node:assert/strict";
import { newStudent } from "../src/transfer";
import { availableIn, choose } from "../src/pick";
import type { ClassItem } from "../src/models";

const students = Array.from({ length: 10 }, (_, i) => newStudent(`S${i}`));
students[3].status = "absent";
students[7].status = "skipped";
const cls: ClassItem = { id: "c", name: "9-A", students };
const present = students.filter(s => s.status === "present");

// A whole round picks every present student exactly once, never the absent or skipped ones.
let seed = 1;
const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
for (let round = 0; round < 50; round++) {
    const picked = new Set<string>();
    for (let pool = availableIn(cls); pool.length; pool = availableIn(cls)) {
        const s = choose(pool, rand)!;
        assert.ok(!picked.has(s.id), "picked twice in one round");
        picked.add(s.id);
        s.hasParticipatedThisRound = true;
    }
    assert.equal(picked.size, present.length);
    students.forEach(s => (s.hasParticipatedThisRound = false));
}

// Edge cases: empty pool, and random() at its extremes stays in bounds.
assert.equal(choose([]), null);
assert.equal(choose(present, () => 0), present[0]);
assert.equal(choose(present, () => 0.9999999), present[present.length - 1]);

console.log("pick checks passed");
