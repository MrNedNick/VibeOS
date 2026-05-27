# VibeOS

> A developer productivity workspace built as a personal OS in the browser.

Live → **https://mrnednick.github.io/VibeOS**

---

## What it is

VibeOS is a single-page app that bundles the tools a developer actually uses every day — tasks, notes, a kanban board, an AI prompt lab, a code snippet vault, and habit tracking — into a unified shell with a shared event bus, keyboard shortcuts, and two languages.

It's built as a portfolio project to show what a well-structured Vue 3 + TypeScript SPA looks like at real scope.

---

## Modules

| Module | What it does |
|--------|-------------|
| **Tasks** | Priority to-dos with j/k/space keyboard nav, due date badges, CSV/JSON export |
| **Notes** | Three-pane workspace — editor · live markdown preview · list. Daily journal, pin, export `.md` |
| **Board** | Kanban view + Timeline swimlane view (rows = date periods). Drag-and-drop sets column AND due date. Import from Tasks. |
| **Studio** | Prompt Lab — Claude Opus / Sonnet / Haiku, API key stored locally, run history, ⌘↵ shortcut |
| **Snippets** | Code vault with highlight.js syntax coloring, language filter, tag search |
| **Habits** | Daily check-offs, 🔥 streak counter, GitHub-style heatmap |
| **Games** | 2048 · Memory Cards (CSS 3D flip) · Snake |
| **Dashboard** | Platform overview — progress per module, Recent Activity feed, all-tasks roll-up |
| **Settings** | Theme · Language · Keyboard shortcuts cheatsheet · Data export / clear |

---

## Tech stack

- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — strict mode, 0 errors
- **Vite 6** — dev server + production build
- **Pinia** — state management (one store per concern)
- **Vue Router 4** — client-side routing
- **Lucide Vue Next** — icon system
- **highlight.js** — syntax highlighting in Snippets
- **marked** — Markdown → HTML in Notes
- **No CSS framework** — all styles are scoped component CSS + design tokens in `main.css`
- **No backend** — localStorage only (Supabase sync planned in S3)

---

## Architecture decisions

| Decision | Reason |
|----------|--------|
| Custom i18n Pinia store (not vue-i18n) | Zero extra deps; `t(key, vars?)` + `pluralRu()` covers all needs |
| `useStorage<T>(key, default, { version, migrate })` | Versioned localStorage with automatic migration — no data loss on schema changes |
| Typed `PlatformEvent` union on event bus | Cross-module communication without coupling; powers Recent Activity feed |
| Lazy `import()` for cross-store calls | Avoids circular Pinia store dependencies (e.g. board → tasks) |
| `SwimlaneRowId` date classification | Cards classified into overdue/today/tomorrow/this-week/later/no-date without a date library |

Full decision log: [`docs/roadmap.md`](docs/roadmap.md)  
Sprint plan + strategy: [`docs/strategy.md`](docs/strategy.md)

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run type-check # vue-tsc --noEmit
```

---

## Sprint plan

| Sprint | Goal | Status |
|--------|------|--------|
| S1 — Identity | Logo, vibe-paks, landing page | 🔄 active |
| S2 — Wow | Command Palette, Settings, Event bus | ✅ mostly done |
| S3 — Backend | Supabase sync, error boundaries | ⏳ next |
| S4 — Module depth | Swimlanes, Studio Lab, Snippets, Habits | ✅ mostly done |
| S5 — Polish | Vitest + CI | ⏳ planned |

---

## Keyboard shortcuts

| Keys | Where | Action |
|------|-------|--------|
| `⌘K` | Global | Command Palette |
| `⌘N` | Notes / Snippets | New note / snippet |
| `⌘F` | Notes / Snippets | Focus search |
| `⌘⇧P` | Notes | Toggle preview |
| `j` / `k` | Tasks | Move focus down / up |
| `Space` | Tasks | Toggle focused task |
| `d` | Tasks | Delete focused task |
| `/` | Tasks | Focus input |
| `⌘↵` | Studio | Run prompt |

---

## License

MIT
