// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
// Reusable UI primitives: toasts, modal dialogs, popover menus, clipboard.
import { h, icon, type Child, type IconName } from "./dom";
import { t } from "./i18n";

/* ========== Toasts ========== */

export interface ToastOptions {
    tone?: "default" | "success" | "error";
    action?: { label: string; run: () => void };
    duration?: number;
}

export function toast(message: string, opts: ToastOptions = {}) {
    let host = document.getElementById("toasts");
    if (!host) {
        host = h("div", { id: "toasts", class: "toasts", "aria-live": "polite" });
        document.body.append(host);
    }
    const tone = opts.tone ?? "default";
    const el = h("div", { class: `toast toast-${tone}`, role: "status" },
        icon(tone === "error" ? "alert" : tone === "success" ? "check" : "info"),
        h("span", { class: "toast-msg" }, message),
        opts.action && h("button", {
            type: "button",
            class: "toast-action",
            onclick: () => {
                close();
                opts.action!.run();
            },
        }, opts.action.label),
    );
    function close() {
        if (!el.isConnected || el.classList.contains("leaving")) return;
        el.classList.add("leaving");
        setTimeout(() => el.remove(), 200);
    }
    host.append(el);
    while (host.children.length > 3) host.firstElementChild!.remove();
    setTimeout(close, opts.duration ?? (opts.action ? 6500 : 2600));
}

/* ========== Modal dialogs ========== */

export interface ModalAction<T> {
    label: string;
    value: T;
    variant?: "primary" | "danger" | "ghost" | "soft";
    submit?: boolean;
}

export interface ModalOptions<T> {
    title: string;
    description?: Child;
    body?: Node | ((done: (value: T) => void) => Node);
    actions: ModalAction<T>[];
    init?: () => void;
}

export function modal<T>(opts: ModalOptions<T>): Promise<T | null> {
    return new Promise(resolve => {
        let result: T | null = null;
        const dlg = h("dialog", { class: "dialog" });
        const done = (value: T) => {
            result = value;
            dlg.close();
        };
        const submitAction = opts.actions.find(a => a.submit);
        const form = h("form", {
                class: "modal",
                onsubmit: (e: Event) => {
                    e.preventDefault();
                    if (submitAction) done(submitAction.value);
                },
            },
            h("header", { class: "modal-head" },
                h("h2", null, opts.title),
                h("button", { type: "button", class: "icon-btn", "aria-label": t("common.close"), onclick: () => dlg.close() }, icon("x")),
            ),
            opts.description && h("p", { class: "modal-desc" }, opts.description),
            opts.body && h("div", { class: "modal-body" }, typeof opts.body === "function" ? opts.body(done) : opts.body),
            h("footer", { class: "modal-foot" }, opts.actions.map(a => h("button", {
                type: a.submit ? "submit" : "button",
                class: `btn btn-${a.variant ?? "soft"}`,
                onclick: a.submit ? null : () => done(a.value),
            }, a.label))),
        );
        form.addEventListener("keydown", e => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                form.requestSubmit();
            }
        });
        // Close when tapping the backdrop (but not when a text selection drag ends there).
        let downOnBackdrop = false;
        dlg.addEventListener("pointerdown", e => { downOnBackdrop = e.target === dlg; });
        dlg.addEventListener("click", e => { if (e.target === dlg && downOnBackdrop) dlg.close(); });
        dlg.addEventListener("close", () => {
            dlg.remove();
            resolve(result);
        });
        dlg.append(form);
        document.body.append(dlg);
        dlg.showModal();
        opts.init?.();
    });
}

export function field(label: string, control: Node) {
    return h("label", { class: "field" }, h("span", { class: "field-label" }, label), control);
}

export async function promptText(title: string, opts: { label: string; value?: string; placeholder?: string; okLabel?: string; description?: string }) {
    const input = h("input", { class: "input", value: opts.value ?? "", placeholder: opts.placeholder ?? "", required: true, autocomplete: "off" });
    const ok = await modal({
        title,
        description: opts.description,
        body: field(opts.label, input),
        actions: [
            { label: t("common.cancel"), value: false, variant: "ghost" },
            { label: opts.okLabel ?? t("common.save"), value: true, variant: "primary", submit: true },
        ],
        init: () => {
            input.focus();
            input.select();
        },
    });
    const value = input.value.trim();
    return ok && value ? value : null;
}

/* ========== Popover menus ========== */

export type MenuItem = { label: string; icon?: IconName; run: () => void; danger?: boolean; disabled?: boolean } | "sep";

let activeMenu: { anchor: HTMLElement; cleanup: () => void } | null = null;

export function closeMenu() {
    activeMenu?.cleanup();
    activeMenu = null;
}

export function openMenu(anchor: HTMLElement, items: MenuItem[]) {
    if (activeMenu?.anchor === anchor) return closeMenu();
    closeMenu();

    const menu = h("div", { class: "menu", role: "menu" }, items.map(item => item === "sep"
        ? h("div", { class: "menu-sep", role: "separator" })
        : h("button", {
            type: "button",
            role: "menuitem",
            class: `menu-item${item.danger ? " danger" : ""}`,
            disabled: item.disabled,
            onclick: () => {
                closeMenu();
                item.run();
            },
        }, item.icon ? icon(item.icon) : h("span", { class: "icon" }), h("span", null, item.label))));
    document.body.append(menu);

    const r = anchor.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(Math.max(margin, r.right - menu.offsetWidth), innerWidth - menu.offsetWidth - margin);
    let top = r.bottom + 6;
    if (top + menu.offsetHeight > innerHeight - margin) top = Math.max(margin, r.top - menu.offsetHeight - 6);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    anchor.setAttribute("aria-expanded", "true");

    const onDown = (e: PointerEvent) => {
        const t = e.target as Node;
        if (!menu.contains(t) && !anchor.contains(t)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            closeMenu();
            anchor.focus();
        }
    };
    const onScroll = (e: Event) => { if (!menu.contains(e.target as Node)) closeMenu(); };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", closeMenu);

    activeMenu = {
        anchor,
        cleanup: () => {
            menu.remove();
            anchor.removeAttribute("aria-expanded");
            document.removeEventListener("pointerdown", onDown, true);
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", closeMenu);
        },
    };
}

/* ========== Clipboard ========== */

export async function copyText(text: string, message = t("clipboard.copied")) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const ta = h("textarea", { value: text, style: "position:fixed;opacity:0;pointer-events:none" });
        document.body.append(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) return toast(t("clipboard.unavailable"), { tone: "error" });
    }
    toast(message, { tone: "success" });
}
