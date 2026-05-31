# Roadmap

> Re-planned 2026-05-27 (v2), updated 2026-05-28 (v3) to reflect shipped state at v0.5.3, updated 2026-05-30 (v4) after visual audit sprint, updated 2026-05-30 (v5) after AI integration + UX sprint, updated 2026-05-31 (v6) after AI assistants + habit purpose sprint, updated 2026-05-31 (v7) after heatmap + finance charts + palette AI sprint.
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

## S1 — Identity ✅ (closed 2026-05-29)

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

> **⏸ PAUSED — 2026-05-30 (v0.6.8)**
> All code is written and deployed. Waiting on user to create the Supabase project.
>
> **Checkpoint — what's done:**
> - `src/core/services/supabase.ts` — lazy Supabase client singleton
> - `src/core/services/supabase.types.ts` — full DB types for all tables
> - `src/core/stores/auth.store.ts` — real signIn/signUp/signOut/getSession/onAuthStateChange
> - `src/core/composables/useCloudSync.ts` — real pullAll/pushAll/pushRecord/deleteRecord with last-write-wins merge
> - `src/modules/auth/views/LoginView.vue` — forgot password flow, Supabase-aware notice
> - `src/modules/auth/views/RegisterView.vue` — email confirmation pending state, password match hint
> - `supabase/migrations/001_init.sql` — all tables + RLS + auto user_settings on signup
> - `.env.example` — template for credentials
>
> **Blocked — needs user action (in order):**
> 1. Go to supabase.com → create new project → copy **Project URL** + **anon key**
> 2. Create `.env.local` in repo root with those two values (see `.env.example`)
> 3. In Supabase SQL Editor, run `supabase/migrations/001_init.sql` — creates all tables + RLS
> 4. In Supabase Auth, create user `demo@vibeos.app` with a known password → seed as demo account
> 5. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` as GitHub Actions secrets (Settings → Secrets)
> 6. After credentials added: restart `npm run dev` locally and test login + register
>
> **S3 items still TODO after credentials are ready:**
> - Demo mode seeding (step 4 above + seed SQL for demo data)
> - "Sign up to save" toast when demo user tries to write (useFeatureGate.ts already has the tier logic)
> - UptimeRobot keep-alive ping (free, prevents Supabase project from pausing due to inactivity)

**Goal:** personal data survives, stays private, and demo mode works for recruiters.

> Architecture fully researched and documented in `docs/auth-plan.md`.  
> Backend decision: **Supabase** (Postgres + Auth + RLS). See auth-plan.md §2 for full comparison vs Firebase / Appwrite / PocketBase.  
> Supabase inactivity pausing mitigated by free UptimeRobot monitor (ping every 3 days).

Order:
1. **Supabase project setup** — create project, `.env.local`, add to GitHub Actions secrets, verify `.gitignore`; set up UptimeRobot keep-alive
2. **Supabase auth — email/password** — `src/core/services/supabase.ts`, `useAuthStore` (login/logout/register/init/isDemoMode), router guard for protected routes
3. **Auth UI** — `/login`, `/register` (gated), `/welcome` landing page with "Try Demo" + "Sign In" CTAs
4. **Database schema** — create all tables with `user_id` FK + `updated_at`; enable RLS; write policies (`auth.uid() = user_id`) on every table; `subscription_tier` in `user_settings`
5. **Demo mode** — create `demo@vibeos.app` account; run seed SQL; "Demo Mode" chip in AppHeader; block writes in demo mode with "Sign up to save" toast
6. **Supabase sync** — offline-first: localStorage primary, dual-write on auth; sync on login (localStorage → upsert all rows); `useSupabaseSync` composable
7. **Subscription tier scaffold** — `useFeatureGate` composable; `free` / `demo` / `pro` tiers defined; all features on `free` for now; Stripe hookup deferred to future sprint
8. **Error boundaries + real 404** — fallback UI on uncaught errors; errors logged to event bus

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

## S5 — Life Depth ✅ (shipped)

**Goal:** Learning, Training, and Analytics modules ship; Dashboard is fully populated.

1. ✅ **Learning module** — plans, sessions, progress rings, streaks, today strip, plan detail view
2. ✅ **Training module** — plans, workout logs, feeling emoji, streaks, km tracking, today strip
3. ⬜ **Habits → Learning + Training integration** — logging session/workout marks associated habit done
4. ✅ **Personal Analytics module** — period selector, habit heatmap, task/learning/training charts, goals progress
5. ✅ **Calendar module** — monthly grid, 5 dot types, click-day detail panel
6. ✅ **Dashboard life stats strip** — habits today, active goals, learning today, training today
7. ✅ **Snippets** — removed (low daily-use value; code fits in Notes)
8. ✅ **Weather widget** — OpenWeatherMap free tier; built-in API key hardcoded in widget so it works for all visitors; no user config needed

---

## S6 — AI Integration

**Goal:** AI becomes a planning assistant across all life modules. Free tier via Pollinations.ai (no key needed); Anthropic/Gemini/Groq with user key as secondary. Everything user-initiated — nothing runs automatically.

Order:
1. ✅ **AI service layer** — `src/core/composables/useAI.ts`; `aiComplete()` standalone helper used by all 8 modules; `useAI()` composable with reactive loading/error for new features
2. ✅ **Daily digest** — `DigestWidget.vue` on Dashboard: on-demand digest using live data from all stores (tasks, goals, habits, learning, training); Pollinations.ai free
3. ✅ **Goal planning** — "Suggest" button in Goal detail milestones section; AI returns bullet list of milestones; each chip adds directly to goal with one click
4. ✅ **Learning plan generator** — "✦ Fill with AI" button in Learning module; enter a topic and AI fills title, emoji, minutesPerSession, targetHours, daysPerWeek
5. ✅ **Learning session analysis** — after logging a session: AI card appears with 2-3 focus suggestions for next session; based on session notes + plan progress
6. ✅ **Workout/Training analysis** — after logging a workout: AI card with specific improvement suggestions; reads sport type, duration, distance, feeling, streak
7. ✅ **Training plan generator** — "✦ Fill with AI" in Training module; enters topic → AI fills title, emoji, sportType, sessionsPerWeek
8. ✅ **Priority assistant** — "✦ Focus" button in Tasks: AI reads pending tasks (priority, due dates, categories) and suggests 2-3 most important with reasoning
9. ✅ **Command Palette AI** — "✦ Ask AI…" in ⌘K Actions; inline response stays in palette; Ask again button; loading spinner
10. **Additional free providers** — Gemini Flash (Google AI Studio key), GroqCloud (fast Llama3/Mixtral), OpenRouter (multi-model); all optional with user key

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

### 2026-05-31 — AI service layer + Dashboard panels + Learning resources (v0.7.4 → v0.7.5)

- **AI service layer (S6/1)** — `src/core/composables/useAI.ts` with `aiComplete(prompt)` standalone helper and `useAI()` composable; all 8 inline fetch-to-Pollinations blocks refactored (TaskManagerView, DigestWidget, GoalDetailView, LearningView, Learning PlanDetailView, TrainingView, Training PlanDetailView, CommandPalette); no behavior changes
- **Dashboard Goals panel (S2/4)** — New "Goals" row in Dashboard sidebar → live panel: active goals with progress %, milestone counts, color-coded progress bars, due-date warnings; "View all" link; empty state with CTA
- **Dashboard Habits panel (S2/4)** — New "Habits" row → live panel: 7-day consistency bar chart, per-habit today status with inline toggle, streak indicators; overflow link for 7+ habits
- **Learning plan resources** — URL bookmark library per plan; type picker (article/video/book/course/podcast/other); mark-as-done toggle; domain shown below title; delete; persisted in plan data; added in PlanDetailView between session history and habit link sections

---

### 2026-05-31 — Task heatmap + Finance charts + Palette AI (v0.7.3 → v0.7.4)

- **Task activity heatmap (S4/5)** — GitHub-style 20-week completion grid in TaskManagerView; appears when user has completed at least one task; uses `completedAt` timestamps; reuses `HabitHeatmap` component; toggled via "📊 Activity" button in header
- **Finance spending charts** — Stacked category breakdown bar (proportional widths + color segments + % legend) at top of Overview tab; day-by-day spending bar chart for the selected month with today highlighted; CSV export button in Transactions tab with filename `expenses-YYYY-MM.csv`
- **Command Palette AI (S6/9)** — "✦ Ask AI…" command in ⌘K Actions group; enters sub-input mode; on Enter: calls Pollinations.ai without closing the palette; response displayed inline with "Ask again" button to reset; loading spinner during fetch

---

### 2026-05-31 — AI assistants + habit purpose (v0.7.2 → v0.7.3)

**5 S6 AI items shipped + habit `purpose` field:**

- **Learning plan generator** (S6/4) — "✦ Fill with AI" toggle in Learning module creates form; enter any topic; AI fills title, emoji, minutesPerSession, targetHours, daysPerWeek from a free Pollinations.ai call; JSON parsed from response with clamped validation
- **Training plan generator** (S6/7) — same pattern for Training; AI fills title, emoji, sportType (validated against `VALID_SPORTS` enum), sessionsPerWeek
- **Learning session analysis** (S6/5) — after logging a session, `analyzeSession()` fires in background; AI card slides in with 2-3 focus suggestions for next session; includes topic, notes, progress %; dismiss button; spinner while analyzing
- **Workout/Training analysis** (S6/6) — after logging a workout, `analyzeWorkout()` fires in background; AI card with improvement suggestions; context: sport type, duration, distance, feeling scale, streak count
- **Task priority assistant** (S6/8) — "✦ Focus" button in TaskManagerView; reads up to 15 pending tasks with priority/due-date/category context; AI returns 2-3 most important with reasoning; dismissable card with fade transition
- **Habit `purpose` field** — optional "why" motivation text on each habit; shown as editable subtitle below habit name in HabitCard (click to edit inline); "Add why…" ghost placeholder on hover; purpose input in creation form; persisted in store

---

### 2026-05-30 — AI integration + UX sprint (v0.7.1 → v0.7.2)

**Batch 1 — v0.7.1 (Global ConfirmDialog + Kanban redesign + Finance months + Weather rewrite):**
- `useConfirm` composable + `UiConfirmDialog.vue` — global singleton promise-based confirm dialog replacing inline two-step patterns across HabitCard, NotesView, BoardView, FinanceView, StudioView, GoalDetailView
- Kanban card redesign — compact meta row (priority dot + due badge + source dot + hover-delete icon); expand chevron rotates; description in collapsed accordion
- Finance month navigation — `‹ Month › ` nav in header, all stats/transactions scoped to selected month
- Weather widget rewritten — Open-Meteo geocoding + forecast API (100% free, no key); WMO weather code → Lucide icon + description

**Batch 2 — v0.7.2 (completedAt tracking, Goals filter, AI integrations, confirm migrations):**
- Completed `useConfirm` migration — Learning + Training PlanDetailViews; removed all dead CSS from danger zones
- Tasks `completedAt` timestamp — set on `toggleTask` when marking done; `doneThisWeek` computed; "🗓 N this week" pill in TaskManagerView
- Goals category filter bar — horizontal filter strip shows when 2+ categories in use; filters active goals grid
- AI Goal Planner (S6 item 3) — "Suggest" button in GoalDetailView milestones section; calls Pollinations.ai; returns clickable chips that add milestones with one click
- Dashboard AI Digest (S6 item 2) — `DigestWidget.vue` full-width card on Dashboard; on-demand digest from live platform data; loading/error/dismiss states

---

### 2026-05-30 — Visual audit sprint (v0.7.0)

**Visual quality pass across 6 modules based on live walkthrough feedback:**

**Analytics module — full CSS redesign:**
- Root cause: all CSS variables used old token names (`--bg-card`, `--text-primary`, `--accent`, `--border`) that don't exist in the current design system → complete visual breakdown
- Fixed all tokens to current VibeOS system (`--color-surface`, `--color-text`, `--color-text-secondary`, `--color-accent`, `--color-border`)
- Improved: larger stat card values, proper period picker border, habit grid rows as visible cards, bar chart grid-line backgrounds, goals displayed as individual bordered cards

**HabitCard — structural layout redesign:**
- Introduced `habit-card__body` wrapper containing `habit-card__left` (info + actions) and `habit-card__heatmap`
- At ≥900px: body switches to `flex-direction: row`; left panel is `flex: 0 0 300px` with right border as divider; heatmap fills remaining space
- `habit-card__connect` remains a direct child of `habit-card` — always renders as full-width footer below both panels (no longer collapses into a third column on desktop)

**Dashboard — removed 4 dev-facing stat cards:**
- Removed "Active Modules", "Roadmap Tasks", "Overall Progress", "Documentation" StatCards from the top strip
- Kept: life stats strip (habits, goals, learning, training today), Recent Activity panel, AllTasksPanel
- Cleaned up: removed `StatCard` import, `TOTAL_DOC_PAGES`, `availableCount`, `platformProgress`, `platformTotalTasks` computeds and `.dashboard__stats` CSS

**About page — identity update:**
- Name: "Nikita Nedyalkov" (full name)
- Title: "App Developer" (was "Frontend Developer")
- Experience: "6+ years"
- Removed company (XOVI GmbH) and location (Cologne, Germany)
- Bio rewritten as broader app developer (UI to backend architecture, Vue 3 + React + TypeScript)

**Studio — Clear History confirmation:**
- Two-step confirmation: clicking "Clear" shows "Delete all" + "Cancel" buttons; auto-cancels after 5 seconds
- Prevents accidental history wipe; no external modal needed

**Settings — OpenWeather API key removed:**
- Removed the OpenWeather API key field and associated state
- Weather widget uses a built-in key; no user config required

**Sprint tasks also shipped in this session (v0.6.9):**
- Task 3: Tasks → Goals integration (`linkedGoalId` on task creation, goal chip on task items)
- Task 4: LearningPlan + TrainingPlan linked habit pickers in PlanDetailViews
- Task 5: Settings module visibility toggles + `useModuleVisibility` composable + sidebar/bottom tab filtering

---

### 2026-05-29 (session — Studio chat redesign + Calendar fixes + Notes wider + Snippets removed) — v0.5.8

**Studio — chat interface** (full details in Backlog → Studio section):
- Complete redesign: single-prompt lab → multi-turn chat
- Critical bug fix: `res.json()` → `res.text()` for Pollinations.ai (was causing all Free AI errors)
- Default provider changed to Free AI
- Clean chat bubble UI with typing indicator, quick prompts, New Chat button

**Calendar improvements:**
- Always-visible right panel (task detail; never closes/toggles)
- Defaults to today's date on mount
- European calendar (Monday first) — `(day.getDay() + 6) % 7`
- Selected day highlighted with accent outline (visible in all themes, including dark)
- Dark theme CSS variable bug fixed (was using `--accent`, `--bg-card`, etc. instead of `--color-accent`, `--color-surface`)
- Unified card layout: left grid + right panel as one bordered container (no separate divider line)

**Notes — wider left column:**
- Desktop: 320px (was 240px)
- Responsive: 260px on tablet (≤1279px), 220px on small laptop (≤1023px)

**Snippets module — removed:**
- Low daily-use value in a life OS context; code fits in Notes (code blocks)
- Deleted: `src/modules/snippets/` folder, router entries, registry entry, i18n keys, event bus type, platform-notes data block, RecentActivityPanel cases

**Plans documented in roadmap:**
- More game skins for all 4 games
- Reusable component system (`src/ui/` expansion)
- Studio future improvements (project data access, markdown rendering, sessions)

---

### 2026-05-28 (session 8 — Analytics, Calendar, Command Palette actions, Notes backlinks, Snake skins, Settings import) — v0.5.3

**Analytics module** — real data from all life stores:
- Period selector: 7 / 30 / 90 days
- 4 stat cards: tasks completed, habit consistency %, learning hours, training sessions
- Habit consistency grid (GitHub-style heatmap per habit)
- Bar charts: tasks by day, learning hours, training sessions
- Goals progress list

**Calendar module** (`/calendar`):
- Monthly grid, Monday-start, prev/next/today navigation
- 5 dot types per day: tasks (blue), habits (green), learning (purple), training (red), goals (amber)
- Click any day → right-side detail panel with full breakdown
- CSS `:has()` 2-column layout; stacks on mobile
- Registered in `PLATFORM_MODULES` under `section: 'life'` — auto-appears in sidebar + bottom tabs More sheet

**Command Palette ⌘K — action commands**:
- Sub-input mode: `activeAction` ref for New Task / New Note / New Goal
- Creates entity on confirm, closes palette
- Habits group: toggle any habit done for today
- 5 theme options (dark / light / terminal / brutalist / soft)
- All strings translated EN + RU

**Notes — backlinks panel**:
- Scans all notes for `[[Title]]` references to the open note
- Collapsible bar below editor — shows count, chevron animation
- Clicking a backlink navigates to that note
- Empty state shows usage hint with `[[Title]]` syntax example

**Snake — skin system** (5 skins):
- Skins: Default (blue, free), Emerald (PB≥5), Crimson (PB≥15), Amethyst (PB≥25), Golden (PB≥40)
- `unlockedSkins` + `activeSkinId` persisted to localStorage
- Unlock check on every new personal best; "new skin unlocked!" overlay with spring-pop animation
- Skin picker grid below board; locked skins show threshold hint

**Settings — data import**:
- Hidden `<input type="file" accept=".json">` triggered by button
- FileReader → JSON.parse → confirm dialog before restore
- Iterates all keys from backup JSON → `localStorage.setItem` → `location.reload()`
- Matches existing export/clear-all UI pattern

---

### 2026-05-28 (session 7 — responsive layout + sidebar redesign + Sudoku)

**Responsive design** — now a top-quality priority for the entire platform:
- **Sidebar redesign** — `position: fixed`, rail mode (52px) on desktop with hover-expand overlay, drawer on mobile/tablet (<1024px), smooth 220ms CSS transitions, no layout jumps; brand logo clickable → home
- **AppLayout** — migrated to `margin-left` offset model; mobile/tablet backdrop with blur; Escape key closes drawer; route-change closes drawer
- **AppHeader** — separate hamburger (mobile/tablet) vs pin-toggle (desktop), each properly scoped with CSS media queries
- **Sidebar groups** — Life → Work → System order; Studio moved to Work; colored section labels (Life=green, Work=blue, System=muted) with Lucide section icons
- **HabitCard wide layout** — heatmap right-aligned with `justify-content: flex-end`; section has own padding; scrollbar hidden; `overflow: hidden` on card prevents bleed
- **Sudoku game** — 3 classic puzzles, 9×9 grid with box separators, cell selection + keyboard nav, real-time conflict detection, timer, win detection, responsive numpad (3×3 desktop / 5+1 mobile)
- **Games lobby** — Sudoku added with amber SVG preview; arrow icon updated to SVG

**Decisions documented:**
- **Snippets** — keep; serves developer use cases (shell commands, SQL, API calls, config templates); distinct from Notes (code vs prose, syntax highlighting); portfolio value
- **Responsive design roadmap** — documented as key quality priority; Phase 1 complete (layout + sidebar); Phase 2 per-module pending

### 2026-05-28 (session 6 — UI polish + Russian + improvements)
- **Settings API Keys panel** — Anthropic + OpenWeather key fields; password masking toggle; key set/not-set status; shared via localStorage with Studio
- **Tasks "Today" filter** — new filter tab; `todayCount` computed in store; shows tasks due today
- **Notes [[wiki links]]** — click `[[Title]]` in preview to navigate to matching note; creates new note if not found
- **Dashboard translations** — all life stat labels and detail panel priority/severity labels use i18n; life stats strip fully translated
- **Settings cleanup** — removed Hotkeys/Shortcuts block (not useful at this stage)
- **Notes list duplication fix** — excerpt now skips the title line when note has no heading
- **Habits wide-screen layout** — at ≥900px cards switch to horizontal: identity left, heatmap right, border separator
- **Control Center (platform-notes.ts)** — fully rewritten in Russian; all 14 modules updated with current state, shipped tasks, next tasks, improvements, tech debt

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

### Habit tracker v2 — strong focus, daily retention (HIGH PRIORITY)

The habit tracker should be the #1 daily-use feature — the thing users open every morning. Currently it works but lacks the hooks that make tracking feel rewarding and frictionless. Everything below should be treated as a focused sprint.

**Retroactive check-ins (explicitly requested):**
- Allow marking any past day as done — user forgets to check in, shouldn't lose streak
- Mini calendar grid on each HabitCard showing last 14 days with toggleable cells
- Long-press / tap on heatmap cell to toggle that specific day
- Store needs `toggleDate(id, date)` that adds/removes any date string (not just today)
- UI guard: can only edit up to 30 days back (no unlimited history rewriting)

**At-risk streak warnings:**
- When streak > 2 and habit not done today: show amber "⚠️ streak at risk" badge
- Dashboard life-stats card turns amber when any habit is at risk
- HabitsView gets an "At risk" filter chip showing endangered habits first
- Optional: end-of-day push notification (browser Notifications API)

**Streak milestone celebrations:**
- When streak crosses 7 / 14 / 30 / 60 / 100 days: toast notification + subtle animation
- Milestone badges on habit card (🎖️ small icon appears at certain thresholds)
- History of milestone dates stored per habit

**Daily engagement hooks:**
- Quick check-in from Dashboard (HabitsPanel already shows toggles — keep them prominent)
- Habit reordering (drag to sort — most important habits at the top)
- "Habit of the day" spotlight (random unchecked habit shown prominently)
- Weekly summary: "Last week you completed X/Y habits, best streak: Z"

**Simplification & UX:**
- First-time empty state is too bare — add 3–4 template habits (Read 10 min, Drink water, Exercise, Meditate)
- Habit creation: emoji picker should be richer, not just a text input
- Make the daily check-in button larger and easier to tap on mobile (currently 40px circle — bump to 48px min)
- Reduce the "Connect to goal" section visibility for new users (hide behind a toggle until they have goals)
- Habit card purpose field (✅ done) — surface it more prominently as a subtitle

**Depth features:**
- Optional check-in notes: short text when marking done ("great run today", "only 5 min but done")
- Habit categories (health / productivity / learning / social / other) with colored indicators
- Skip day (vacation mode): mark a day as intentionally skipped without breaking streak
- Longest streak (all-time record) shown alongside current streak
- Habit creation date + "age" badge (e.g. "Day 45")

---

### Full UI Redesign — Revolut-style modern design (planned — S8)
Complete visual redesign of the entire platform. Goal: looks like a premium product, not a dev tool.

**Inspiration:** Revolut app, Linear, Vercel, Raycast — clean surfaces, tight spacing, purposeful animation, bold typography.

**Design principles:**
- **Dark-first** — deep near-black surfaces (`#0a0a0f`, `#111118`), not flat grey
- **Accent is earned** — one color pops; everything else is muted
- **Spacing discipline** — 4px grid strictly; sections breathe but don't waste space
- **Micro-interactions** — hover glows, number counters, smooth transitions everywhere
- **Typography hierarchy** — weight contrast, not size contrast; SF Pro / Inter
- **Glassmorphism selectively** — blur panels for overlays and cards, not everything
- **Status as design element** — progress rings, streaks, activity dots feel alive

**Scope:**
1. **Design token audit** — extend `main.css` with full palette: `--color-surface-0/1/2/3`, `--color-glow-*`, `--shadow-*`, elevation system
2. **Typography scale** — define `--text-xs` through `--text-3xl` with matching `line-height`
3. **Motion tokens** — `--ease-spring`, `--ease-smooth`, `--duration-fast/base/slow`
4. **Component library restyle** — every `@/ui` component redesigned to new system
5. **Module-by-module pass** — Dashboard → Sidebar → Games → All modules
6. **Vibe-paks v2** — redesign all 5 themes to match new visual system

**Research phase (before implementation):**
- Screenshot Revolut app key screens
- Study Raycast design system for reference
- Define 10 key screens to redesign first (Dashboard, Sidebar, Login, Goals, Analytics most visible)

---

### Component Library page — `/ui-kit` (planned — S8)
A live, interactive showcase of every `@/ui` component — like Storybook but inside VibeOS itself.

**Purpose:** shows recruiters the depth of the design system; documents components for development.

**Page structure:**
- Left sidebar: component categories (Inputs, Feedback, Data Display, Navigation, Layout)
- Main area: component cards — each shows live example + code snippet
- Theme switcher at top (tests all vibe-paks at once)
- Search bar to filter components

**Components to document:**
- `UiButton` — all variants (primary/secondary/ghost/danger) + sizes + loading state
- `UiBadge` — colors, sizes
- `UiInput` / `UiTextarea` / `UiSelect` — states (default/focus/error/disabled)
- `UiProgressRing` — sizes, colors, label options
- `UiEmptyState` — with/without icon, with/without CTA
- `UiIcon` — full icon grid from lucide-vue-next
- `UiCard` (once built) — elevations, variants
- `UiModal` (once built) — sizes, with/without header/footer
- `UiStat` (once built) — number, trend, ring variants

**Route:** `/ui-kit` visible only in dev mode or accessible via Settings → Developer

---

### About page v3 — Personal selling page (planned — S8)
Redesign `/about` from info card to a proper personal portfolio/selling page.

**Goal:** a recruiter landing here should understand in 10 seconds: who you are, what you build, why you're worth hiring.

**Structure:**
1. **Hero** — name, title, current role (XOVI GmbH), 2-line positioning statement ("I build full-stack products..."), LinkedIn + GitHub CTA buttons
2. **What I'm good at** — 3-4 skill groups as visual cards, not bullet lists (Frontend Systems, TypeScript, Vue Ecosystem, Product Thinking)
3. **VibeOS itself** — "This is what I built" — module count, lines of code approx, key decisions explained (auth, data model, AI layer)
4. **Timeline / career story** — horizontal scrollable timeline or vertical scroll; each role has a 1-line impact statement
5. **Languages** — flag chips: Ukrainian, Russian, German (B1), English (B2)
6. **Contact section** — LinkedIn, GitHub, email — large tap targets, no forms
7. **Philosophy statement** — "I ship because..." personal engineering ethos

**Tone:** confident, direct, no corporate fluff. Like a really good README.

**Visual:** dark, premium feel matching new design system. Photos optional (can be avatar/initials).

---

### Global ConfirmDialog component (planned — S6, high priority)
A reusable project-level confirmation modal consumed by any module that needs a destructive action confirmed.

**Motivation:** Studio's "Clear History" needed inline two-step logic because there was no shared confirm modal. Board "Delete card", Notes "Delete note", Settings "Clear all data" all need the same pattern.

**Implementation:**
- `src/ui/UiConfirmDialog.vue` — modal with title, body text, confirm button (danger), cancel button
- Teleports to `<body>` via Vue's `<Teleport>`
- `useConfirm()` composable: returns a `confirm(opts)` promise-based API; caller `await`s it; resolves `true`/`false`
- Usage: `const ok = await confirm({ title: 'Delete history?', body: 'This cannot be undone.', danger: true })`
- Replaces the inline two-step logic in Studio; wire into Board, Notes, Settings "clear all" as well
- Keyboard: Enter confirms, Escape cancels
- Focus trap within modal while open

**Scope of refactor after building:**
1. Studio sidebar: replace `confirmingClear` two-step with `useConfirm()`
2. Settings → Data: replace existing 5s "Are you sure?" with `useConfirm()`
3. Notes: wire delete note through `useConfirm()`
4. Board: wire delete card through `useConfirm()`
5. Habits: wire delete habit through `useConfirm()`

---

### Kanban Board card redesign (planned — S4 depth)
Current board cards are too narrow and tall — the layout doesn't use horizontal space well.

**Issues:**
- Cards are cramped vertically with most horizontal space wasted
- Title wraps too aggressively at current card width
- No visual breathing room between card content elements

**Planned changes:**
- Increase card max-width, ensure columns use full available width
- Reorganize card content: title top, then a compact meta row (priority chip + due date + category icon) below
- Add subtle color strip on left edge for priority (matches TaskItem pattern)
- Hover state: lift shadow, not just border color change
- Reduce card padding on mobile for denser view

---

### Weather widget — built-in API key (planned — S5 completion)
Remove requirement for users to enter their own OpenWeather API key.

**Status:** API key field removed from Settings (v0.7.0). Weather widget needs the built-in key wired up.

**Implementation:**
- Store the API key as a Vite env variable (`VITE_WEATHER_API_KEY`) or hardcoded constant in `WeatherWidget.vue`
- For GitHub Pages deploy: add key as GitHub Actions secret; inject via `vite.config.ts` `define`
- Widget uses the built-in key; falls back gracefully if request fails (show "–" not error)
- Remove any remaining references to user-configured weather key from Settings store/composables

---

### Reusable component system (planned — S4/S5)
Create a unified component library so every module is built from the same building blocks:
- **Design tokens audit** — ensure all colors, radii, spacing, typography defined as CSS variables in `main.css`
- **`src/ui/` component library** — already started; extend with: `UiCard`, `UiButton`, `UiBadge`, `UiInput`, `UiTextarea`, `UiSelect`, `UiModal`, `UiEmptyState`, `UiStatCard`, `UiProgressRing`, `UiAvatar`, `UiDot`
- **Pattern**: every module should import from `@/ui` rather than defining its own variants of common elements
- **Goal**: new modules should be assembley of `@/ui` components; visual consistency guaranteed by tokens
- **Steps**: (1) audit existing one-off styles across modules; (2) extract to `@/ui`; (3) refactor each module to use shared components; (4) document in `docs/conventions.md`

### Finance / Money module (planned — S6+, needs improvement)
Personal expense tracking and spending regulation. Current state needs significant design improvement before it's usable daily.

**Current issues (flagged in visual audit 2026-05-30):**
- Visual design needs a full pass to match the rest of the app's quality level
- Currency widget/view needs a clearer purpose and better data entry UX

**Planned improvements:**
- **Expense entry**: amount, category (food / transport / housing / health / entertainment / savings / other), date, optional note; quick-add inline form
- **Budget limits**: set monthly cap per category; visual remaining indicator (progress ring or bar)
- **Monthly overview**: bar chart spend by category, total spent vs budget, over-budget warnings
- **Transactions list**: recent expenses, sortable, filterable by category and date range
- **Dashboard widget**: current month snapshot, "X categories over budget" alert
- **Multi-currency**: select display currency; conversion via free ExchangeRate-API (1500 req/month)
- **Data**: `platform:finance:expenses` and `platform:finance:budgets` in localStorage; export CSV
- **Future**: bank CSV import, recurring transactions
- **Long-term**: candidate for extraction as standalone personal finance app

### iOS Habit Tracker app (future standalone project)
Extract VibeOS Habits module into a native iOS app:
- **Goal**: publish to App Store; hands-on iOS distribution experience
- **Stack**: SwiftUI (preferred) or React Native
- **Core features**: daily check-offs, streaks, heatmap, habit creation, push notifications, home screen widget
- **Differentiator**: clean focused design, no subscription, iCloud sync
- **Distribution**: App Store, free + optional tip
- **Timeline**: after Habits module reaches full depth in VibeOS (post-S5); standalone development starts S8+
- See `docs/strategy.md § 10` for full description

### Responsive design — Phase 2 (per-module)
Phase 1 is complete (sidebar, layout, header).
Remaining per-module responsive work:
- **Dashboard** — stat cards 2×2 on tablet, 1-col on mobile; Today panel adapts
- **Notes** — hide preview on mobile (edit-only), collapse note list
- **Docs** — sidebar becomes top dropdown on mobile
- **Kanban** — mobile card list view (no drag on touch)
- **Habits/Goals/Learning/Training** — already responsive (card grids)
All Phase 2 items are non-blocking; polish when each module is next touched.

### Snippets — removed (2026-05-29)
**Removed.** Module deleted: low daily-use value in a life OS context; developer snippet workflow fits better in Notes (code blocks with highlighting). All routes, registry entries, i18n keys, and event types cleaned up.

### Analytics module
Unified personal stats: habit heatmap, task completion rate, learning hours, workout frequency, goal progress. Planned for S5.

### Tabs / window manager
Open modules as tabs in the shell (`<KeepAlive>`) so state survives navigation. Optional "stage view" with draggable windows for screenshots. High effort — defer past S7.

### Logo redesign (planned — S8)
Current logo (`▮ VibeOS`) is functional but not distinctive enough as a visual identity mark.

**Direction (from visual audit 2026-05-30):** needs a proper rethink — something that works as a favicon, a sidebar mark, and a header brand simultaneously.

**Options to explore:**
- Geometric mark (abstract symbol representing the "OS" concept)
- Stylized initials "VO" in a custom typeface treatment
- Keep the block cursor concept but render it as a custom SVG with more visual weight
- A minimal icon that works at 16px, 32px, and 128px

**Deliverables:**
1. SVG logo mark (works as favicon + sidebar icon)
2. Full logotype (mark + "VibeOS" wordmark)
3. Update: `public/favicon.svg`, sidebar brand element, About page hero, README

---

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
Shipped: Minesweeper, Memory, Snake (with 5 unlock-gated skins), Sudoku.
Next candidates: Tetris, 15-Puzzle, Wordle-clone.

**More skins for all games (planned):**
- **Snake** — already has 5 skins; add more milestone-gated skins (e.g. Neon, Retro, Ocean, Rainbow)
- **Minesweeper** — add board themes: Classic, Dark, Retro, Neon; unlock by best time
- **Memory** — add card themes: Animals, Emoji, Symbols, Abstract; unlock by win count
- **Sudoku** — add color themes: Classic, Dark, Pastel; unlock by puzzles solved
Each game should persist `activeSkinId` + `unlockedSkins` in localStorage, matching Snake's pattern.

### Studio — chat interface + Free AI fix (shipped 2026-05-29)
**Studio completely redesigned** from a single-prompt lab into a proper chat interface:
- **Chat mode** — conversation history with user/assistant bubbles; multi-turn context sent to API
- **Input bar at bottom** — Enter to send, Shift+Enter for new line; textarea auto-resizes
- **Typing indicator** — three-dot bounce animation while waiting for response
- **Quick prompts** — 4 suggestion buttons on empty state to get started instantly
- **New chat** button — clears conversation and starts fresh
- **System prompt** — collapsible advanced setting (persisted per-session in localStorage)
- **Provider tabs** — Free AI (default) | Claude API; Free AI has "no key" badge
- **Model chips** — pill selectors per provider (replaces verbose card buttons)
- **Copy button** — per-message copy on assistant responses; "Copied!" flash feedback
- **Error bubbles** — errors appear as red assistant messages inline in the conversation, not blocking the whole view

**Critical bug fixed:** `runFree()` was calling `await res.json()` but `POST https://text.pollinations.ai/` returns `Content-Type: text/plain`. Changed to `await res.text()`. This was the root cause of all Free AI errors.

**Architecture change:** Store now uses `ConvMessage[]` (chat history) instead of single `StudioRun`. Full conversation history is passed to Pollinations on every send for multi-turn context. Error messages are part of the history with `error: true` flag and are excluded from API calls.

**Free AI default:** Provider now defaults to `'free'` (was `'anthropic'`). Claude API is still available as secondary tab.

**Pollinations.ai** — still the only free provider (no key, no account, CORS-enabled):
- `openai-fast` → GPT-4o mini (fast)
- `mistral` → Mistral (open source)
- `llama` → Meta Llama 3

**Removed from Studio UI:** max tokens input, history sidebar, left/right column split.

### Studio — future improvements (TODO backlog)
These are the meaningful improvements to do next — not features for features' sake:

**Priority 1 — Chat history sidebar (Claude-style interface):**
- Left sidebar with list of past conversations (like Claude.ai)
- Each conversation has a title (auto-generated from first message or user-editable)
- "New chat" creates a new conversation entry; old ones persist
- Click any past conversation to restore the full message history
- Conversation list sorted by last activity; shows model used + message count
- Conversations stored in localStorage under `platform:studio:conversations`
- Max 50 saved conversations; oldest auto-pruned

**Priority 2 — Project data access (AI as life OS assistant):**
- "Include my context" toggle before sending — injects a structured summary of user's VibeOS data:
  - Active goals (title, progress %, days remaining)
  - Today's tasks (pending, completed)
  - Habits today (checked vs not checked)
  - Learning sessions this week (plan name, hours)
  - Training sessions this week (plan name, workouts logged)
- Context is appended as a system message, not visible in chat bubbles
- User controls what data to include (toggle per category)
- This enables queries like "what should I focus on today?" or "am I on track for my goals?" with real data

**Priority 3 — Markdown rendering:**
- Render AI responses as markdown (code blocks, lists, headings, bold) using `marked`
- Currently `white-space: pre-wrap` only; code blocks look like plain text
- Use `DOMPurify` for XSS safety if adding it as a dep, otherwise sanitize manually

**Other improvements:**
- Export conversation as markdown or plain text
- Free AI model descriptions tooltip (speed, quality, best-for)
- **Additional free providers** (S6, user provides key):
  - **Gemini Flash** — Google AI Studio free tier; 60 req/min; no credit card for dev key
  - **GroqCloud** — 30 req/min on Llama3/Mixtral; very fast inference
  - **OpenRouter** — routes to multiple free models; single key
- **AI planning actions** (S6) — "Plan my week", "Review my goals", "Suggest a workout" — pre-built prompt templates that inject context automatically
- Token count display for long conversations

### External data widgets (future)
- **Weather widget** — OpenWeatherMap free tier (60 calls/min, no credit card); Dashboard widget; API key in Settings — partially planned in S5
- **Currency rates** — free.currencyapi.com or ExchangeRate-API free tier (1500 req/month); Dashboard mini-widget
- **Maps / location context** — low priority; possible for Training module (route tracking) in S5+
- **GitHub activity widget** — already listed; REST API, 5000 req/hour unauthenticated

### Settings future ideas
- ✅ **Module visibility toggles** — show/hide modules from sidebar (shipped v0.6.9 via `useModuleVisibility` composable)
- ✅ **Data import** — restore from JSON backup (shipped)
- ✅ **OpenWeather API key removed** — built-in key used instead; no user config needed (v0.7.0)
- Notification preferences (browser notifications for habits reminders)
- Privacy settings (local-only vs synced data preference)

### Learning module future improvements
- Resource library with URL bookmarks and notes per resource
- Session timer with Pomodoro integration
- Weekly learning report with goal progress
- AI-generated study plans (S6)
- Export session log as CSV

### Training module future improvements
- Exercise library with notes and personal records
- Workout templates (reuse past plans)
- Volume/intensity progression charts
- AI workout analysis after each session (S6)
- Export workout log as CSV

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
| 2026-05-29 | S3 auth architecture research complete | Full comparison: Supabase vs Firebase vs Appwrite vs PocketBase vs custom. Supabase confirmed. Key risk (inactivity pausing) documented with free mitigation. Full spec in docs/auth-plan.md |
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
| Calendar view sprint placement | ✅ Shipped (S5) | Monthly grid, dots, detail panel |
| Mobile PWA | Unscheduled | Research after S5; depends on how mobile-critical check-ins become |
| Analytics: standalone module or dashboard tab? | ✅ Shipped as standalone module | Dashboard has summary strip; Analytics module has full detail |
| Snippets module: keep or remove? | Open | Low daily-use value in a life OS context; already built and stable; keep until there's a clear reason to remove |
| Studio: Anthropic-only or multi-provider? | ✅ Decided | Free AI (Pollinations.ai) = default, no key; Claude API = secondary tab; other providers (Gemini, Groq, OpenRouter) planned for S6 with user key |
