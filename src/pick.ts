// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
// The fairness rule: only present students who haven't had a turn this round can be picked.
import type { ClassItem, Student } from "./models";

export function availableIn(cls: ClassItem): Student[] {
    return cls.students.filter(s => s.status === "present" && !s.hasParticipatedThisRound);
}

export function choose(pool: Student[], random: () => number = Math.random): Student | null {
    return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
