# VibeOS

> A simpler Notion for your life — where everything is connected. Log one thing, and the rest updates on its own.

Live → **https://mrnednick.github.io/VibeOS**

![Bundle Size](https://img.shields.io/badge/initial_JS-46_kB_gzip-informational?style=flat-square) ![Tests](https://img.shields.io/badge/tests-664_passing-brightgreen?style=flat-square) ![Lighthouse Accessibility](https://img.shields.io/badge/accessibility-100%2F100-brightgreen?style=flat-square) ![Lighthouse Performance](https://img.shields.io/badge/performance-82%2F100-yellowgreen?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)

---

## What it is

VibeOS is a light, no-setup daily tool for the parts of life Notion makes you build by hand — habits, tasks, goals, learning, training, notes — in one place where **everything is connected**. Check off a habit and its linked goal advances on its own. Log a workout and the habit checks itself off. One action cascades across modules; nothing to wire up.

No databases to configure, no templates to wrestle. Open the link and use it. Your data stays in your browser by default (versioned localStorage), and signing in syncs it across devices through Supabase — auth, row-level security, offline queue and real-time merge are live. And the built-in AI already knows your data — ask it anything, free, no key required.

---

## Modules

| Module | What it does |
|--------|-------------|
| **Dashboard** | Daily command center — Today strip, habits, goals, pinned notes, cross-module digest |
| **Tasks** | Priorities, due dates, categories, goal links. Keyboard nav (`j/k/space/d`) · CSV/JSON export |
| **Board** | Kanban + Timeline swimlane views of the same task data. Drag-and-drop sets column AND due date. |
| **Goals** | Life goals with milestones, progress tracking, linked tasks, AI planning |
| **Habits** | Daily check-offs, streak counter, GitHub-style heatmap, linked goals, AI pattern insights |
| **Notes** | Three-pane workspace — list · editor · live preview. Daily journal, wiki backlinks, pin, `.md` export, AI summarise + action items |
| **Learning** | Structured study plans — sessions, hours tracking, resources, habit integration, AI plan generation |
| **Training** | Workout plans and session logs — running, strength, any sport. AI workout analysis. |
| **Finance** | Expense tracking, category budgets, monthly charts, AI spending analysis |
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
- **Supabase** — auth + row-level security + JSONB key-value sync, offline queue, real-time merge (live)
- **Vitest + Playwright** — 664 unit tests in 62 files, plus E2E smoke and auth suites

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
npm test           # vitest run (664 tests, happy-dom)
npm run test:e2e   # playwright E2E
```

---

## Sprint history

| Sprint | Goal | Status |
|--------|------|--------|
| S1 — Identity | Life OS first impression, vibe-paks, landing | ✅ complete |
| S2 — Command Center | Dashboard panels, ⌘K command palette, sidebar | ✅ complete |
| S3 — Backend + Auth | Supabase auth + RLS + offline sync | ✅ complete — live |
| S4 — Core Life Modules | Goals, Tasks life categories, Habits→Goals | ✅ complete |
| S5 — Life Depth | Learning, Training, Analytics | ✅ complete |
| S6 — AI Integration | AI in 9 modules | ✅ complete |
| S7 — Polish | Vitest test suite, CI gate, Lighthouse 82, a11y 100 | ✅ complete |
| S8 — Design System | @/ui component library + /ui-kit showcase page | ✅ complete |
| S9 — Full Redesign | Revolut/Linear premium visual identity | ✅ complete |
| S10 — Vibe-pak Consolidation | 4 clean paks: Dark, Light, Brutalist, CRT Retro | ✅ complete |
| S11 — Welcome & Positioning | New welcome page + "everything connected" cascade | ✅ complete |
| S12 — AI Depth | AI in every data module — Analytics report, Habits insights, Notes summarise, Finance analysis | ✅ complete |
| S13 — Design Pass | Module-by-module quality pass | 🔜 planned |
| S14 — Quick Wins | Lazy routes, soft-delete, AI provider seam | ✅ complete |
| S15 — Refactor & De-dup | Extract shared composables, split god-components | ✅ complete |
| S16 — Test Coverage | 664 tests in 62 files — stores, components, composables | ✅ complete |
| S17 — Component Unification | All modules migrated to @/ui; ESLint enforcement | ✅ complete |
| S18 — Product Analytics & Feedback | Interaction tracking, feedback modal, Usage tab, Privacy settings | ✅ complete |
| S19–S22 — Mobile, Auth & UX | Mobile excellence, auth hardening, `user_store` sync layer, FAB + empty states | ✅ complete |
| S23–S27 — Games, Demo & Profile | Tetris skins, demo seeding, mobile QA, avatar upload, Studio providers | ✅ complete |
| S28 — Sync Integrity | Demo-data leak fix, realtime echo loop, merge correctness, tombstones | ✅ complete |
| S29 — Security Hardening | DOMPurify sanitising on all `v-html` markdown paths | ✅ complete |
| S32 — Onboarding Module | Replace demo data with an interactive new-user tutorial | 🔜 planned |

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
