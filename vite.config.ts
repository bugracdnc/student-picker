// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Buğra Çalışkandinç
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
    base: "./",
    plugins: [viteSingleFile()],
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
