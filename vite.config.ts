// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// Copyright (C) 2026 Buğra Çalışkandinç
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
    base: "./",
    plugins: [viteSingleFile()],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // Single-file build has no preload links, and leaving out Vite's polyfill keeps third-party code out of the bundle
        modulePreload: { polyfill: false },
    },
});
