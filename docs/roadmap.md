# Roadmap

> Re-planned 2026-05-27 (v2) around a 7-sprint structure.
> Repositioned: VibeOS evolves from developer showcase to personal life operating system.
> See `docs/strategy.md` for the full product context.
> See `docs/privacy-security.md` for the auth/demo/security plan.

---

## Active sprint plan

| Sprint | Goal | Key outcome |
|--------|------|-------------|
| **S1 — Identity** | Life OS first impression | New tagline, logo, vibe-paks, Lucide icons, copy pass, landing |
| **S2 — Command Center** | Dashboard becomes daily-useful | Command palette ⌘K, Settings, Dashboard life panels, event bus extended |
| **S3 — Backend + Auth** | Real product, private data | Supabase auth, protected routes, demo mode (seeded account), RLS |
| **S4 — Core Life Modules** | Goals + task unification | Goals module, Tasks life categories, Habits → goal integration |
| **S5 — Life Depth** | Learning + Training + Analytics | Learning module, Training module, Personal Analytics, full Dashboard |
| **S6 — AI Integration** | AI as planning layer | Daily digest, goal planning, learning plans, workout analysis (user key only) |
| **S7 — Polish** | Credibility + reliability | Vitest + CI gate, Lighthouse, a11y, error boundaries, preview deploys |

---

## S1 — Identity (active)

**Goal:** a cold visitor lands on the URL, understands "personal life OS" in 10 seconds, and is hooked by the visual.

Order:
1. **Positioning + tagline update** — update all copy from "developer workspace" to "personal life OS" framing; update `docs/strategy.md` (done)
2. **Logo mark + accent color** — replace `//` with blinking block cursor `▮` (or custom VibeOS mark)
3. **Vibe-paks v1** — ship 2 packs: Terminal Dark + Brutalist; main visual hook
4. **Lucide icon system** — replace unicode glyphs with `lucide-vue-next`; include life icons (Target, Dumbbell, BookOpen, BarChart2)
5. **Copy personality pass** — empty states, tooltips, loading skeletons, 404 voice
6. **Landing page at `/welcome`** — separate marketing from OS shell; "Try Demo" + "Sign In" CTAs
7. **README with demo GIF** — record after vibe-paks ship

---

## S2 — Command Center

**Goal:** the dashboard becomes genuinely useful as a daily life command center; the OS metaphor becomes real.

Order:
1. **Command Palette ⌘K** — highest single-feature ROI; life module commands registered centrally ("Add goal", "Log workout", "Start learning session")
2. **Settings module** — Appearance / Account / Keys / Data / Shortcuts / About tabs; unblocks Studio and vibe-pak picker
3. **Event bus — extend for life events** — add `goal.*`, `habit.*`, `workout.*`, `learning.*` event types
4. **Dashboard redesign** — Today panel, Goals panel, Habits panel, Learning/Training indicators; dev metrics move to Platform tab
5. **Sidebar restructure** — Life / Work / System sections (replace System / Apps)
6. **About / Profile page** — `/about` with bio + links; portfolio anchor

---

## S3 — Backend + Auth

**Goal:** personal data survives, stays private, and demo mode works for recruiters.

Order:
1. **Schema versioning + migration runner** — `useStorage(key, default, { version, migrations })`; must precede Supabase (already done for localStorage layer)
2. **Supabase auth — email/password** — `useAuthStore`, login/logout/register, protected router guard
3. **Protected routes** — all module routes behind auth; `/welcome` and `/login` public
4. **Demo mode** — create `demo@vibeos.app` account; seed with realistic fake data (see `docs/privacy-security.md` for full seed list); "Demo Mode" chip in header
5. **Supabase sync** — extend stores to sync with Supabase on login; offline-first (localStorage primary, sync on auth)
6. **Row Level Security** — enable RLS on all tables; policy: `auth.uid() = user_id` on every table
7. **Error boundaries + real 404** — fallback UI on uncaught errors; errors logged to event bus

---

## S4 — Core Life Modules

**Goal:** Goals module ships; Tasks become life-aware; Habits connect to Goals.

Order:
1. **Tasks — life categories** — add `category` field (work / learning / training / personal / goal); add `linkedGoalId?`; update TaskList filters and TaskForm
2. **Goals module** — full implementation per `docs/modules/goals.md`; GoalCard, GoalDetail, milestones, progress, dashboard widget
3. **Habits → Goals integration** — marking a habit done can increment goal progress; habit card shows linked goal name
4. **Notes — types + backlinks** — note type field (plan / idea / journal / project / learning / training); `[[wiki backlinks]]`; link notes to goals
5. **Tasks (depth)** — Today view, Focus mode (Pomodoro timer), Streaks heatmap, natural-language input (`chrono-node`)
6. **Board** — final polish; ensure unified with Tasks data model

---

## S5 — Life Depth

**Goal:** Learning, Training, and Analytics modules ship; Dashboard is fully populated.

Order:
1. **Learning module** — full implementation per `docs/modules/learning.md`; plans, sessions, progress, dashboard widget
2. **Training module** — full implementation per `docs/modules/training.md`; plans, workout logs, today indicator, dashboard widget
3. **Habits → Learning + Training integration** — logging session/workout marks associated habit done
4. **Personal Analytics module** — unified stats view: habit heatmap, task completion rate, learning hours chart, workout frequency, goal progress overview, weekly digest
5. **Dashboard — full life panels** — Today (tasks + habits + learning + training), Goals panel, Stats row; everything populated
6. **Snippets** — retain; polish if needed (already complete)
7. **Weather widget** — OpenWeatherMap free tier; Dashboard widget (API key in Settings)

---

## S6 — AI Integration

**Goal:** AI becomes a planning assistant, not just a prompt lab. User-provided API key, no auto-billing.

All features are user-initiated (button click). Nothing runs automatically.

Order:
1. **AI service layer** — `core/services/ai.ts`; wraps Anthropic API; reads user's key from Settings → Studio; shows token estimate before each call
2. **Daily digest** — button on Dashboard: summarize today's tasks + habits + goals in 2-3 sentences
3. **Goal planning** — in Goal detail view: "AI: suggest tasks and milestones for this goal"
4. **Learning plan generator** — "I want to learn [topic] in [N] weeks — generate a plan"
5. **Workout analysis** — after logging a workout: "Analyze this session and suggest what to improve"
6. **Priority assistant** — "What should I focus on today?" — AI reads current tasks + goals + today's schedule
7. **Command Palette AI** — "Ask AI: [anything]" command → Studio-like response inline

---

## S7 — Polish & Testing

- **Vitest + Vue Test Utils** — first wave of unit/component tests (goals store, learning progress calculation, task category filter)
- **CI gate** — type-check + tests must pass on PRs
- **Lighthouse audit** — Performance, Accessibility, Best Practices scores
- **a11y audit** — keyboard navigation, focus management, screen reader basics
- **Error boundaries** — all module routes wrapped; graceful fallback UI
- **Preview deploys per PR** — Vercel free tier
- **Bundle size badge** in README

---

## Recently shipped (history)

### 2026-05-27 (session 5 — life modules + polish)
- **Learning module** — full implementation: plans, session logs, progress rings, streaks, today strip, plan detail view
- **Training module** — full implementation: plans, workout logs, feeling emoji, streaks, km tracking, today strip, plan detail view
- **Goals module** — full implementation: goals with milestones, progress, target dates, category, detail view with debounced notes
- **Minesweeper** — replace 2048: 9×9 grid, 10 mines, first-click safety, flood-fill reveal, flags, timer, best time
- **Snake: wall wrapping** — boundary collision → modulo wrap (classic Snake behavior)
- **Notes: remove split mode** — EditorMode is now 'edit' | 'preview' only; ⌘⇧P toggles edit↔preview
- **Task categories** — filter chips (Work/Learning/Training/Personal/Goal) + colored badge on task items
- **Dashboard life stats** — new strip: Habits today, Active goals, Learning today, Training today — clickable to each module
- **Dynamic version** — `__APP_VERSION__` injected via Vite; Dashboard header + About page always reflect package.json version
- **RecentActivityPanel** — handles all new event types: learning, training, goals, milestones
- **Goals sorted by target date** — nearest due date shown first in active goals list
- **package.json renamed** — `frontend-platform` → `vibeos`
- **Version bump rule + push rule** — documented in CLAUDE.md: always push after commit to trigger GitHub Pages deploy

### 2026-05-27 (session 3 — fast wins)
- **README.md** — complete portfolio README: modules table, tech stack, architecture decisions, keyboard shortcuts, sprint plan, run instructions
- **Event bus hardening** — correct `card:created` / `card:moved` event types; new `studio:run` event type; `snippet:created` wired in snippets store; Recent Activity panel handles all types
- **Settings → Data section** — export all localStorage as dated JSON backup; clear-all with 5s confirm-or-cancel dialog
- **Settings → Keyboard shortcuts** — full cheatsheet table with `<kbd>` pill styling covering all 15 global shortcuts
- **Settings + About → `available`** — both modules promoted from `wip` to `available`
- **Tasks due dates** — `dueDate?: string` on Task; overdue (red) / today (amber) / upcoming (muted) badge
- **About page v2** — shipped modules list (7 modules), quick stats row, live site link
- **Board swimlanes + task unification** — S4 differentiator: Timeline view with date-based swimlane rows × status columns; 2D drag-and-drop; Kanban ↔ Timeline toggle; task import panel
- **i18n system** — custom Pinia store (zero new deps), EN + RU locales, 90+ translated keys, `pluralRu()` helper
- **Settings module** — Appearance tab: theme + language toggles; stub sections for Keyboard / Data / Account
- **About page** — VibeOS logo SVG, tech stack grid, GitHub link, responsive
- **Habits improvements** — inline name editing, confirm-before-delete, Russian plural streaks
- **Games lobby redesign** — inline SVG previews, best scores, per-game color accents
- **Memory Cards + Snake** — CSS 3D flip card game, canvas snake with difficulty levels
- **Page transition fix** — opacity-only, `@after-leave` hook prevents layout shift
- **Command Palette** — `wip` modules navigable, strings translated
- **Event bus** — typed `PlatformEvent` union, Pinia store, wired into tasks/habits/notes
- **Dashboard Recent Activity** — live feed of last 12 events
- **Notes "Today" button** — opens or creates daily journal note, idempotent
- **localStorage schema versioning** — `useStorage(key, default, { version, migrate })`
- **Kanban Board** — 3-column drag-and-drop, inline creation, priority color strips
- **Studio module** — Prompt Lab v1: model selector, API key local storage, run history

### 2026-05-27 — Strategic repositioning (this session)
- **docs/strategy.md v2** — full rewrite: personal life OS positioning, dual-mode (personal + demo), module ecosystem, unified data model, updated sprint plan
- **docs/privacy-security.md** — new: data classification, RLS plan, demo mode design (seeded account), auth plan, risk table, S3 implementation checklist
- **docs/modules/goals.md** — new: Goals module spec (data model, components, views, store, Supabase schema, dashboard integration)
- **docs/modules/training.md** — new: Training module spec (plans, workout logs, today logic, habits integration, AI analysis S6)
- **docs/modules/learning.md** — new: Learning module spec (plans, sessions, progress, resources, habits integration, AI generation S6)
- **docs/roadmap.md v2** — updated to 7-sprint structure reflecting life OS direction

### 2026-05-26
- Module quick-launch button in Dashboard
- Copy button on code blocks in Docs
- Anchor links on headings with hash deep-link
- Sidebar search + collapsible sections + full-text search across docs
- Keyboard shortcuts in Notes (`⌘N` / `⌘F` / `⌘⇧P`)
- Inline task editing (double-click)
- Notes app v1: three-pane workspace, live markdown preview, 300ms debounced auto-save
- Code block syntax highlighting in Notes preview (highlight.js)
- Tasks: priority levels, undo delete, keyboard nav (j/k/space/d//), CSV/JSON export, duplicate detection
- Pin notes, word count + reading time, export note as .md
- Platform rebranded to VibeOS
- Sidebar sections: System / Apps

---

## Deployment

Live at https://mrnednick.github.io/VibeOS (GitHub Pages).

Vercel preview deploys per PR — planned for S7.

Post-S3: production connects to Supabase. Demo account seeded.

---

## Backlog (not yet scheduled)

### Analytics module
Unified personal stats: habit heatmap, task completion rate, learning hours, workout frequency, goal progress. Planned for S5.

### Tabs / window manager
Open modules as tabs in the shell (`<KeepAlive>`) so state survives navigation. Optional "stage view" with draggable windows for screenshots. High effort — defer past S7.

### Additional vibe-paks
After v1 ships with 2 packs: Soft Glass (backdrop-filter blur) and CRT Retro (green phosphor + scanlines).

### Per-app accent color
Allow each module to override platform accent in Settings → Appearance.

### Achievements system
Use event bus to track milestones ("Created first goal", "30-day habit streak", "Completed a learning plan"). Game-like layer.

### Calendar view
Monthly calendar showing tasks, training sessions, and learning sessions in one unified view. A natural S5/S6 addition.

### Mobile companion
Progressive Web App (PWA) wrapper for mobile. Critical if Training/Learning check-ins need to happen on the go. Research after S5.

### Spotify Now Playing
Personal touch widget on Dashboard. Needs OAuth flow. Post-S3.

### GitHub activity widget
Dashboard widget: recent commits + contribution graph. GitHub REST API, 5000 req/hour unauthenticated.

### Currency widget
Demoted from standalone module to Dashboard widget. Low priority.

### Games backlog
After Memory and Snake: Tetris or Minesweeper.

---

## Backend options reference

| Option | Free tier | Status |
|--------|-----------|--------|
| **Supabase** (chosen) | 500MB, 50K rows, 2 projects | S3 |
| **Turso (libSQL)** | 9GB storage, 500M reads/month | Fallback if Supabase feels heavy |
| **Neon (Postgres)** | 512MB, 1 project | Alternative |
| **localStorage** (current) | Unlimited | Offline-first base; remains primary |

---

## Decisions log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-27 | Repositioned VibeOS as personal life OS | User wants a real daily-use system, not just a portfolio demo; "personal OS" is more compelling and demonstrates broader engineering |
| 2026-05-27 | Keep name "VibeOS" | Established on GitHub, the "vibe" concept extends naturally to life OS |
| 2026-05-27 | 7-sprint plan: Identity → Command Center → Backend+Auth → Core Life → Life Depth → AI → Polish | Life modules added in S4/S5; AI deferred to S6; stays buildable without surprise costs |
| 2026-05-27 | Demo mode: seeded Supabase account (not local fixtures) | Shows full features including auth + sync; more impressive to recruiters; one code path |
| 2026-05-27 | Email/password auth (not GitHub OAuth) | Simpler for personal app; GitHub OAuth adds complexity without benefit for single-user personal app |
| 2026-05-27 | Goals module planned for S4 | Central connector for all life modules; needed before Learning and Training to enable goal linking |
| 2026-05-27 | Sidebar restructure: Life / Work / System | Reflects life OS positioning; groups modules by role rather than technical function |
| 2026-05-27 | AI integration deferred to S6 | No implementation now; architecture planned; keeps costs zero until intentional |
| 2026-05-27 | 5-sprint plan (prior) → 7-sprint plan | Prior plan was developer-only; new life modules require 2 extra sprints |
| 2026-05-27 | Supabase chosen as backend | Free tier, Postgres, Auth, RLS, Realtime — portfolio value in days |
| 2026-05-27 | Vibe-paks v1: Terminal Dark + Brutalist | Two distinct moods sufficient to demonstrate the system |
| 2026-05-27 | Lucide icons replace unicode glyphs | System-wide visual coherence; includes life module icons |
| 2026-05-27 | Currency demoted from module to Dashboard widget | Low daily-use value as standalone |

---

## Open decisions

| Item | Status | Notes |
|------|--------|-------|
| Demo mode: seeded account vs local fixtures | Decided: seeded account | See privacy-security.md |
| Sidebar section names: Life / Work / System | Proposed — confirm before S2 |  |
| Tasks module final codename | Deprioritized | "VibeOS Tasks" is fine for now |
| Notes module final codename | Deprioritized | Same |
| Custom domain vibeos.dev / vibeos.app | Defer until after S1 design pass | Worth buying once the design is share-worthy |
| Calendar view sprint placement | Unscheduled | Natural fit in S5 or as S6 addition |
| Mobile PWA | Unscheduled | Research after S5; depends on how mobile-critical check-ins become |
| Analytics: standalone module or dashboard tab? | Undecided | Lean toward standalone module with Dashboard summary widget |
