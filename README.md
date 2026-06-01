# VibeOS

> A personal life OS — tasks, goals, habits, notes, learning, training, analytics, and AI in one place.

Live → **https://mrnednick.github.io/VibeOS**

![Bundle Size](https://img.shields.io/badge/initial_JS-46_kB_gzip-informational?style=flat-square) ![Tests](https://img.shields.io/badge/tests-68_passing-brightgreen?style=flat-square) ![Lighthouse Accessibility](https://img.shields.io/badge/accessibility-100%2F100-brightgreen?style=flat-square) ![Lighthouse Performance](https://img.shields.io/badge/performance-82%2F100-yellowgreen?style=flat-square)

---

## What it is

VibeOS is a personal life OS: a single app where everything is connected. Your task list knows about your goals. Your habit streaks feed the analytics. Your AI report pulls from all of it.

Not a demo that mimics real tools — a real tool that also demonstrates sophisticated engineering.

Built with Vue 3 + TypeScript + Vite. No CSS frameworks. No unnecessary dependencies. State is versioned localStorage today; Supabase sync is coded and waiting on credentials.

---

## Modules

| Module | What it does |
|--------|-------------|
| **Dashboard** | Daily command center — Today strip, habits, goals, pinned notes, cross-module digest |
| **Tasks** | Priorities, due dates, categories, goal links. Keyboard nav (`j/k/space/d`) · CSV/JSON export |
| **Board** | Kanban + Timeline swimlane views of the same task data. Drag-and-drop sets column AND due date. |
| **Goals** | Life goals with milestones, progress tracking, linked tasks, AI planning |
| **Habits** | Daily check-offs, streak counter, GitHub-style heatmap, linked goals |
| **Notes** | Three-pane workspace — list · editor · live preview. Daily journal, wiki backlinks, pin, `.md` export |
| **Learning** | Structured study plans — sessions, hours tracking, resources, habit integration, AI plan generation |
| **Training** | Workout plans and session logs — running, strength, any sport. AI workout analysis. |
| **Finance** | Expense tracking, category budgets, monthly charts |
| **Analytics** | Personal stats — habit heatmap, task completion, learning hours, training trends, AI monthly report |
| **Calendar** | Monthly grid with habit and task dots |
| **Studio** | AI chat lab — Claude (Opus/Sonnet/Haiku) with your API key, or GPT-OSS free, conversation history |
| **Games** | Tetris, Snake, Minesweeper, Memory Cards, Sudoku |
| **Settings** | Vibe-paks (Dark/Light/Brutalist/CRT Retro) · EN/RU locale · API keys · Data export/clear |
| **About** | Project info, version, links |
| **Docs** | In-app documentation |

---

## Tech stack

- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — strict mode, 0 errors
- **Vite 6** — dev server + production build, code-split by module
- **Pinia** — state management, one store per concern
- **Vue Router 4** — lazy-loaded module routes
- **Lucide Vue Next** — icon system
- **marked** — Markdown → HTML in Notes
- **highlight.js** — syntax highlighting (lazy-loaded chunk)
- **No CSS framework** — scoped component CSS + design tokens in `main.css`
- **Supabase** — auth + RLS + sync (code complete, awaiting project setup)

---

## Architecture decisions

| Decision | Reason |
|----------|--------|
| Custom i18n Pinia store (not vue-i18n) | Zero extra deps; `t(key, vars?)` + `pluralRu()` covers all needs |
| `useStorage<T>(key, default, { version, migrate })` | Versioned localStorage — no data loss on schema changes |
| Soft-delete tombstones on all synced entities | Merge conflicts resolve correctly when Supabase sync lands |
| Typed `PlatformEvent` union on event bus | Cross-module communication without coupling; powers Dashboard digest |
| Single AI provider seam (`provider.ts`) | Swap endpoint/model via env vars — 8 call sites untouched |
| Lazy `import()` for all module routes | Initial JS 46 kB gzip; module code loads on demand |
| Tasks unified with Board cards | One entity, multiple views — list, kanban, timeline, dashboard widget |
| Vibe-paks via `[data-theme]` attribute | Zero JS theme switching; each pak is a pure CSS variable override |

Full decision log: [`docs/roadmap.md`](docs/roadmap.md)  
Coding conventions: [`docs/conventions.md`](docs/conventions.md)

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run type-check # vue-tsc --noEmit
npm test           # vitest run (68 tests, happy-dom)
```

---

## Sprint history

| Sprint | Goal | Status |
|--------|------|--------|
| S1 — Identity | Life OS first impression, vibe-paks, landing | ✅ complete |
| S2 — Command Center | Dashboard panels, ⌘K command palette, sidebar | ✅ complete |
| S3 — Backend + Auth | Supabase auth + RLS + offline sync | ⏸ paused — code done, awaiting Supabase credentials |
| S4 — Core Life Modules | Goals, Tasks life categories, Habits→Goals | ✅ complete |
| S5 — Life Depth | Learning, Training, Analytics | ✅ complete |
| S6 — AI Integration | AI in 9 modules | ✅ complete |
| S7 — Polish | 68 Vitest tests, CI gate, Lighthouse 82, a11y 100 | ✅ complete |
| S8 — Design System | @/ui component library + /ui-kit showcase page | ✅ complete |
| S9 — Full Redesign | Revolut/Linear premium visual identity | ✅ complete |
| S10 — Vibe-pak Consolidation | 4 clean paks: Dark, Light, Brutalist, CRT Retro | ✅ complete |
| S11 — Welcome & Positioning | New welcome page + "everything connected" cascade | 🔜 next |
| S12 — AI Depth | AI monthly report ✅ · Habits/Notes/Finance pending | 🔄 active |
| S13 — Design Pass | Module-by-module quality pass | 🔜 planned |
| S14 — Quick Wins | Lazy routes, soft-delete, AI provider seam | 🔄 active |
| S15 — Refactor & De-dup | Extract shared composables, split god-components | 🔜 planned |
| S16 — Test Coverage | Store/component tests, E2E, manual QA | 🔜 planned |

---

## Keyboard shortcuts

| Keys | Where | Action |
|------|-------|--------|
| `⌘K` | Global | Command Palette |
| `⌘N` | Notes | New note |
| `⌘F` | Notes | Focus search |
| `⌘⇧P` | Notes | Toggle preview |
| `j` / `k` | Tasks | Move focus down / up |
| `Space` | Tasks | Toggle focused task done |
| `d` | Tasks | Delete focused task |
| `/` | Tasks | Focus input |
| `⌘↵` | Studio | Send message |

---

## License

MIT
