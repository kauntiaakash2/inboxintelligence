# Environment — inspected 2026-10-31

| Item                 | Detected                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Project root         | `/home/kauntiakash2/AI-ML/inboxIntel` (Linux filesystem, not `/mnt/c`)                                    |
| OS                   | Ubuntu 22.04.5 LTS (Jammy)                                                                                |
| Kernel               | 6.6.87.2-microsoft-standard-WSL2, x86_64                                                                  |
| Shell                | `/bin/bash`, GNU Bash 5.1.16                                                                              |
| Git                  | 2.34.1; empty directory initially, no repository or commits                                               |
| Node                 | v24.13.0, compatible supported LTS line                                                                   |
| npm                  | 11.6.2                                                                                                    |
| Node manager         | `nvm` command and conventional `~/.nvm/nvm.sh` not detected; other managers not comprehensively ruled out |
| Codex                | `/home/kauntiakash2/.local/bin/codex`, codex-cli 0.166.0                                                  |
| Initial dependencies | None; no package configuration                                                                            |
| Git identity         | Existing configured identity detected; not modified or reproduced in documentation                        |
| Filesystem policy    | Read-only sandbox; repository writes and build output require approved execution                          |
| Browsers             | Playwright Chromium caches exist; browser compatibility checked separately                                |

The kernel identifies WSL2; the Windows-side WSL package version and Windows build were not accessible or verified. VS Code WSL integration was specified by the owner, not independently inspected.

Use npm and the installed Node 24 line. `.nvmrc` records 24; engine constraint is >=24.13.0 <25. The latest exact LTS patch was not installed: changing host Node or shell configuration needs approval. Existing Node meets the toolchain's actual compatibility checks. If an upgrade becomes necessary, install NVM only with owner approval and select a supported LTS release. No sudo, system installer, shell edits or global dependency installation was performed.

Required: Node/npm, Git and a modern browser. Optional: VS Code WSL, NVM, Playwright browser binaries. `npm ls --depth=0` reports exact installed versions; package-lock.json is the reproducible dependency record. Core choices were checked against [Vite](https://vite.dev/guide/), [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite), [Vitest coverage](https://vitest.dev/guide/coverage), and [Node release policy](https://nodejs.org/en/about/previous-releases). See VERIFICATION.md for executed checks and unresolved advisories.

## Installed top-level packages

| Package                     | Resolved version | Role             |
| --------------------------- | ---------------- | ---------------- |
| lucide-react                | 1.66.0           | Runtime          |
| react                       | 19.3.1           | Runtime          |
| react-dom                   | 19.3.1           | Runtime          |
| @eslint/js                  | 10.0.1           | Development only |
| @playwright/test            | 1.64.1           | Development only |
| @tailwindcss/vite           | 4.3.3            | Development only |
| @testing-library/jest-dom   | 7.0.1            | Development only |
| @testing-library/react      | 16.3.3           | Development only |
| @testing-library/user-event | 14.6.8           | Development only |
| @types/node                 | 26.6.6           | Development only |
| @types/react                | 19.3.0           | Development only |
| @types/react-dom            | 19.3.0           | Development only |
| @vitejs/plugin-react        | 6.1.2            | Development only |
| @vitest/coverage-v8         | 5.0.5            | Development only |
| eslint                      | 10.14.0          | Development only |
| eslint-plugin-react-hooks   | 7.1.1            | Development only |
| eslint-plugin-react-refresh | 0.5.7            | Development only |
| globals                     | 17.13.0          | Development only |
| jsdom                       | 29.1.1           | Development only |
| prettier                    | 3.9.10           | Development only |
| tailwindcss                 | 4.3.3            | Development only |
| typescript                  | 6.0.3            | Development only |
| typescript-eslint           | 8.72.1           | Development only |
| vite                        | 8.3.5            | Development only |
| vitest                      | 5.0.5            | Development only |
