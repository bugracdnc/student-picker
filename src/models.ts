export type Status = "present" | "absent" | "passed";

export interface Student {
    id: string;
    name: string;
    status: Status;
    participationCount: number;         // total times participated
    score: number;                       // plus/minus score
    hasParticipatedThisRound?: boolean; // session flag
}

export interface ClassItem {
    id: string;
    name: string;
    students: Student[];
}

export interface LogEntry {
    type: "participation" | "score";
    classId: string;
    studentId: string;
    delta?: number; // score changes
    ts: string;
}

export interface AppData {
    classes: ClassItem[];
    logs: LogEntry[];
}