# VibeOS — Platform Overview

> Updated 2026-06-04. Reflects shipped state at v2.2.4.
> ⚠️ **Keep this file current.** After every sprint or significant feature, update the version, state table, and module list in the same commit that ships the work. Stale docs break future AI sessions.


**VibeOS** is a personal life operating system — a real daily-use app that tracks everything that matters: goals, habits, tasks, learning, training, finances, and more. Built in Vue 3, TypeScript, and Vite. Used every day by its creator.

It also functions as a portfolio anchor: the "personal life OS" concept is more compelling to technical recruiters than a generic task manager, because it demonstrates real product thinking at scale.

---

## Current State

| Field | Value |
|-------|-------|
| **Version** | 2.2.4 |
| **Live URL** | https://mrnednick.github.io/VibeOS |
| **GitHub** | https://github.com/MrNedNick/VibeOS |
| **TypeScript** | ✅ Strict mode, 0 errors (enforced on every commit) |
| **Tests** | ✅ 369 Vitest unit tests in 27 files + Playwright E2E smoke (5 scenarios) |
| **Backend** | ⏸ Supabase code complete, awaiting user setup (see S3 status) |
| **Storage** | ✅ localStorage-first, full offline operation |
| **AI** | ✅ Free tier (Pollinations.ai `openai-fast`, no key) + Claude API (user key) |
| **Deployment** | ✅ GitHub Actions → GitHub Pages on every push to `main` |
| **Design system** | ✅ S8+S17 complete — all modules on @/ui, ESLint enforcement |
| **Visual redesign** | ✅ S9+S10 complete — Dark/Light/Brutalist/CRT Retro (4 paks) |
| **Analytics** | ✅ S18 complete — interaction tracking, NPS feedback, Usage tab |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Vue 3 (Composition API, `<script setup>`) |
| **Build** | Vite 6 |
| **Language** | TypeScript 5 (strict) |
| **State** | Pinia 2 |
| **Routing** | Vue Router 4 (lazy-loaded module views) |
| **Storage** | `useStorage()` composable → localStorage (offline-first) |
| **AI (free)** | Pollinations.ai — no API key needed |
| **AI (premium)** | Anthropic Claude API — user provides key in Settings |
| **Markdown** | `marked` |
| **Icons** | `lucide-vue-next` |
| **Backend (planned)** | Supabase (Postgres + Auth + RLS) — code complete, awaiting credentials |

---

## Shipped Modules (v0.9.3)

| Module | Path | Status | Key features |
|--------|------|--------|-------------|
| **Dashboard** | `/` | ✅ | Today panel, Goals/Habits/Finance/Achievements widgets, AI Digest, live stats |
| **Tasks** | `/tasks` | ✅ | Priority, categories, goal linking, Pomodoro, AI focus, activity heatmap |
| **Board** | `/board` | ✅ | Kanban + Timeline, drag-and-drop, search & priority filter |
| **Notes** | `/notes` | ✅ | Markdown, wiki backlinks, note types, goal linking |
| **Goals** | `/goals` | ✅ | Milestones, progress, AI suggestions, linked tasks & notes |
| **Habits** | `/habits` | ✅ | Streaks, categories, skip days, retroactive check-ins, milestones, drag reorder |
| **Learning** | `/learning` | ✅ | Plans, sessions, AI analysis, resources, streaks |
| **Training** | `/training` | ✅ | Plans, workout logs, AI coaching, resources |
| **Finance** | `/finance` | ✅ | Expenses, budgets, charts, multi-currency, recurring |
| **Analytics** | `/analytics` | ✅ | Habit heatmap, task/learning/training charts |
| **Calendar** | `/calendar` | ✅ | Monthly grid, 5 dot types, day detail |
| **Studio** | `/studio` | ✅ | AI chat (Free AI + Claude API) |
| **Games** | `/games` | ✅ | Snake, Minesweeper, Memory, Sudoku, Tetris — each with skins |
| **Settings** | `/settings` | ✅ | 6 vibe-paks, language (EN/RU), module visibility, API keys, data export |
| **About** | `/about` | ✅ | Portfolio page with live stats |
| **Docs** | `/docs` | ✅ | In-app docs with full-text search |

---

## Design System (S8 complete — v0.8.x)

### Component library — `src/ui/`
All shared UI lives in `@/ui`. Changing a component style = editing one file. Components:
`UiButton`, `UiCard`, `UiBadge`, `UiInput`, `UiField`, `UiSectionLabel`, `UiStat`,
`UiProgressBar`, `UiProgressRing`, `UiFilterChips`, `UiEmptyState`, `UiSkeleton`,
`UiModal`, `UiConfirmDialog`, `UiPlannedView`, `UiIcon`.

### Design tokens — `src/assets/styles/main.css`
- **Shadows** `--shadow-0` → `--shadow-4` (per-theme overrides for all vibe-paks)
- **Typography** `--text-2xs` → `--text-3xl`, `--leading-2xs` → `--leading-3xl`
- **Motion** `--ease-smooth`, `--duration-fast/base/slow`
- **Surfaces** `--color-surface-0/1/2/3`
- **Radius** `--radius-xs` → `--radius-xl`

### Vibe-paks — 6 themes

| Theme | Mood |
|-------|------|
| **Dark** (default) | Deep dark surfaces, blue accent — shadow tokens use opacity |
| **Light** | Clean white, high contrast |
| **Synthwave** | Dark purple, magenta accent — shadows glow accent |
| **Brutalist** | Off-white, bold black borders |
| **Soft Glass** | Frosted translucent, soft blue, backdrop-filter blur |
| **CRT Retro** | Phosphor green terminal, CSS scan-line overlay |

> **S9 Phase 4 (next):** Refine all 6 vibe-paks to use the new elevation/surface tokens fully.

---

## AI Features (Pollinations.ai — no key required)

| Feature | Module | Trigger |
|---------|--------|---------|
| AI Focus assistant | Tasks | "✦ Focus" button |
| Goal milestone suggestions | Goals | "✦ Suggest" button |
| Learning plan generator | Learning | "✦ Fill with AI" |
| Session analysis | Learning | After logging session |
| Training plan generator | Training | "✦ Fill with AI" |
| Workout analysis | Training | After logging workout |
| Daily Digest | Dashboard | "Generate" button |
| Ask AI | ⌘K palette | "✦ Ask AI…" command |

---

## Achievements System

10 predefined achievements tracked via the event bus. Toast notification on unlock, persisted in localStorage. Viewable in Dashboard → Achievements panel.

---

## Architecture Principles

- **Offline-first** — all data in localStorage; Supabase sync is optional layer
- **Module isolation** — each module only imports from `@/core/*` and `@/ui/*`
- **Event bus** — typed PlatformEvent union for cross-module communication
- **useStorage** — reactive localStorage ref with auto-persistence
- **useAI** — centralized Pollinations.ai wrapper used by all 8 AI features

See `docs/architecture.md` for full structural details.

---

## Development Philosophy

- **No decisions deferred** — if something is clearly the right call, ship it
- **Type safety always** — `npm run type-check` must pass before every commit
- **Version bumped on every ship** — current version always visible in About + Dashboard
- **Roadmap-driven** — new features are planned in `docs/roadmap.md` before implementation
- **Docs stay current** — after every sprint, docs updated same session
