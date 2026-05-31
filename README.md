# VibeOS

> A personal life operating system — tasks, goals, habits, notes, learning, and training in one place.

Live → **https://mrnednick.github.io/VibeOS**

![Bundle Size](https://img.shields.io/badge/bundle-528_kB_gzip-informational?style=flat-square) ![Tests](https://img.shields.io/badge/tests-59_passing-brightgreen?style=flat-square) ![Lighthouse Accessibility](https://img.shields.io/badge/accessibility-100%2F100-brightgreen?style=flat-square) ![Lighthouse Performance](https://img.shields.io/badge/performance-82%2F100-yellowgreen?style=flat-square)

---

## What it is

VibeOS is a personal life OS: a single app where you manage everything that matters day to day. Not a demo that mimics real tools — a real tool that also happens to demonstrate sophisticated engineering.

Built with Vue 3 + TypeScript + Vite. No CSS frameworks. No unnecessary dependencies. All state is versioned localStorage today, Supabase sync in S3.

It serves two audiences:
- **Personal use** — authenticated, your real data, all modules
- **Portfolio demo** — seeded demo account for recruiters, no personal data exposed

---

## Modules

### Available now

| Module | What it does |
|--------|-------------|
| **Dashboard** | Daily command center — all tasks, recent activity, platform overview |
| **Tasks** | Priorities, due dates, categories, goal links. Keyboard nav (`j/k/space/d`) · CSV/JSON export |
| **Board** | Kanban + Timeline swimlane views. Same task data, two visual modes. Drag-and-drop sets column AND date. |
| **Notes** | Three-pane workspace — list · editor · live preview. Daily journal, wiki backlinks, pin, export `.md` |
| **Habits** | Daily check-offs, streak counter, GitHub-style heatmap |
| **Snippets** | Code vault with syntax highlighting, language filter, tag search |
| **Studio** | AI Prompt Lab — Claude Opus / Sonnet / Haiku, run history, token tracker, ⌘↵ shortcut |
| **Settings** | Theme · Language · Keyboard shortcuts cheatsheet · Data export / clear |

### Planned

| Module | Sprint | What it will do |
|--------|--------|----------------|
| **Goals** | S4 | Life goals with milestones, progress tracking, and linked tasks |
| **Learning** | S5 | Structured learning plans — daily sessions, hours tracking, habit integration |
| **Training** | S5 | Workout plans and session logs — running, strength, any sport |
| **Analytics** | S5 | Personal stats — habit heatmap, task completion rate, learning hours, training trends |

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
- **No CSS framework** — scoped component CSS + design tokens in `main.css`
- **No backend yet** — versioned localStorage with migration runner; Supabase in S3

---

## Architecture decisions

| Decision | Reason |
|----------|--------|
| Custom i18n Pinia store (not vue-i18n) | Zero extra deps; `t(key, vars?)` + `pluralRu()` covers all needs |
| `useStorage<T>(key, default, { version, migrate })` | Versioned localStorage — no data loss on schema changes |
| Typed `PlatformEvent` union on event bus | Cross-module communication without coupling; powers Recent Activity feed |
| Lazy `import()` for cross-store calls | Avoids circular Pinia store dependencies (e.g. board → tasks) |
| `SwimlaneRowId` date classification | Cards classified into overdue/today/this-week/later without a date library |
| Sidebar: System / Life / Work sections | Reflects life OS positioning — groups modules by role, not technical function |
| Tasks unified with Board cards | One entity, multiple views — list, kanban, timeline, dashboard widget |

Full decision log: [`docs/roadmap.md`](docs/roadmap.md)  
Strategy + positioning: [`docs/strategy.md`](docs/strategy.md)  
Privacy + auth plan: [`docs/privacy-security.md`](docs/privacy-security.md)

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
| **S1 — Identity** | Tagline, vibe-paks, landing page, logo, copy | 🔄 active |
| **S2 — Command Center** | Dashboard life panels, Command Palette, sidebar restructure | ⏳ next |
| **S3 — Backend + Auth** | Supabase email/password auth, demo mode, RLS, offline sync | ⏳ planned |
| **S4 — Core Life Modules** | Goals module, Tasks life categories, Habits → Goals integration | ⏳ planned |
| **S5 — Life Depth** | Learning, Training, Analytics modules | ⏳ planned |
| **S6 — AI Integration** | Daily digest, goal planning, workout analysis (user API key) | ⏳ planned |
| **S7 — Polish** | Vitest + CI gate, Lighthouse, a11y audit | ⏳ planned |

---

## Keyboard shortcuts

| Keys | Where | Action |
|------|-------|--------|
| `⌘K` | Global | Command Palette |
| `⌘N` | Notes / Snippets | New note / snippet |
| `⌘F` | Notes / Snippets | Focus search |
| `⌘⇧P` | Notes | Toggle preview |
| `j` / `k` | Tasks | Move focus down / up |
| `Space` | Tasks | Toggle focused task done |
| `d` | Tasks | Delete focused task |
| `/` | Tasks | Focus input |
| `⌘↵` | Studio | Run prompt |

---

## License

MIT
