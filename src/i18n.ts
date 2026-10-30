// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// Copyright (C) 2026 Buğra Çalışkandinç
// Translation lookup. Text itself lives in translations.ts.
import { DEFAULT_LANG, translations, type Lang, type MessageKey } from "./translations";
import type { Child } from "./dom";

const LANG_KEY = "student-picker:lang";

type Params = Record<string, string | number>;

let lang: Lang = readLang();

function readLang(): Lang {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved && saved in translations) return saved as Lang;
    } catch { /* ignore */ }
    // First visit: follow the browser's language when we have it.
    const preferred = (navigator.languages ?? [navigator.language]).map(l => l.slice(0, 2)).find(l => l in translations);
    return (preferred as Lang | undefined) ?? DEFAULT_LANG;
}

export function getLang(): Lang {
    return lang;
}

export function setLang(next: Lang) {
    lang = next;
    document.documentElement.lang = next;
    try {
        localStorage.setItem(LANG_KEY, next);
    } catch { /* ignore */ }
}

function resolve(key: MessageKey, l: Lang, n: number) {
    const msg = translations[l][key] ?? translations[DEFAULT_LANG][key];
    if (typeof msg === "string") return msg;
    return new Intl.PluralRules(l).select(n) === "one" ? msg.one : msg.other;
}

/** Translate `key`, filling `{placeholders}` from `params`. `params.n` selects plural forms. */
export function t(key: MessageKey, params: Params = {}): string {
    return resolve(key, lang, Number(params.n ?? 0))
        .replace(/\{(\w+)\}/g, (m, name) => name in params ? String(params[name]) : m);
}

/** Like `t`, but placeholders may be DOM nodes (e.g. a <strong> or <kbd>). */
export function tRich(key: MessageKey, parts: Record<string, Child>): Child[] {
    return resolve(key, lang, 0).split(/\{(\w+)\}/).map((piece, i) => i % 2 ? parts[piece] ?? `{${piece}}` : piece);
}

/** The text of `key` in every language — used to recognise imported data written in any of them. */
export function allVariants(key: MessageKey): string[] {
    return (Object.keys(translations) as Lang[]).flatMap(l => {
        const msg = translations[l][key];
        return typeof msg === "string" ? [msg] : [msg.one, msg.other];
    });
}
