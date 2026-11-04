---
name: termux-npm-shebang
description: "npm/npx fail in Claude's Termux shell (/usr/bin/env bad interpreter); run node entry points directly"
metadata:
  node_type: memory
  type: project
  originSessionId: e3cd721b-f54f-4e14-80f1-55c77d3c16a7
  modified: 2026-10-30T11:54:22.492Z
---

In Claude's Bash shell on this Termux setup, `npm`, `npx` and `node_modules/.bin/*` fail with `/usr/bin/env: bad interpreter` (termux-exec isn't preloaded; setting LD_PRELOAD mid-shell didn't help).

**Why:** shebang `#!/usr/bin/env node` can't resolve without termux-exec.

**How to apply:** run tools via node directly — `node node_modules/typescript/bin/tsc`, `node node_modules/vite/bin/vite.js build`, then `mv dist/index.html dist/student-picker.html` for the build; `sh scripts/release.sh` for the release (already uses node paths). Tell the user these stand in for `npm run build/release`.
