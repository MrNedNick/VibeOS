# Roadmap

> Re-planned 2026-05-27 (v2), updated 2026-05-28 (v3) to reflect shipped state at v0.5.3.
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
7. ✅ **Snippets** — retained; already complete
8. ⬜ **Weather widget** — OpenWeatherMap free tier; Dashboard widget (API key in Settings)

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

### Reusable component system (planned — S4/S5)
Create a unified component library so every module is built from the same building blocks:
- **Design tokens audit** — ensure all colors, radii, spacing, typography defined as CSS variables in `main.css`
- **`src/ui/` component library** — already started; extend with: `UiCard`, `UiButton`, `UiBadge`, `UiInput`, `UiTextarea`, `UiSelect`, `UiModal`, `UiEmptyState`, `UiStatCard`, `UiProgressRing`, `UiAvatar`, `UiDot`
- **Pattern**: every module should import from `@/ui` rather than defining its own variants of common elements
- **Goal**: new modules should be assembley of `@/ui` components; visual consistency guaranteed by tokens
- **Steps**: (1) audit existing one-off styles across modules; (2) extract to `@/ui`; (3) refactor each module to use shared components; (4) document in `docs/conventions.md`

### Finance / Money module (planned — S6+)
Personal expense tracking and spending regulation:
- **Expense entry**: amount, category (food / transport / housing / health / entertainment / savings / other), date, optional note
- **Budget limits**: set monthly cap per category; visual remaining indicator
- **Monthly overview**: bar chart spend by category, total spent vs budget, over-budget warnings
- **Transactions list**: recent expenses, inline quick-add form
- **Dashboard widget**: current month snapshot, "X categories over budget" alert
- **Data**: `platform:finance:expenses` and `platform:finance:budgets` in localStorage; export CSV
- **Future**: bank CSV import, multi-currency, recurring transactions
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

### Free AI in Studio (shipped 2026-05-29)
**Pollinations.ai** integrated as "Free AI" provider — no API key, no account required, CORS-enabled.
- Provider toggle: Claude API ↔ Free AI in Studio top bar
- Free models: GPT-4o mini (openai-fast), Mistral, Llama 3
- Uses `POST https://text.pollinations.ai/` with OpenAI-compatible message format
- Falls back to CORS error message if blocked

**Other researched alternatives (require user API key):**
- **Gemini Flash** — Google AI Studio free tier; 60 req/min; no credit card for dev key
- **GroqCloud** — 30 req/min on Llama3/Mixtral; fast inference
- **OpenRouter** — routes to multiple free models; single key
Integration of these planned for S6 (user provides key in Settings).

### External data widgets (future)
- **Weather widget** — OpenWeatherMap free tier (60 calls/min, no credit card); Dashboard widget; API key in Settings — partially planned in S5
- **Currency rates** — free.currencyapi.com or ExchangeRate-API free tier (1500 req/month); Dashboard mini-widget
- **Maps / location context** — low priority; possible for Training module (route tracking) in S5+
- **GitHub activity widget** — already listed; REST API, 5000 req/hour unauthenticated

### Settings future ideas
- Module visibility toggles (show/hide modules from sidebar)
- Notification preferences (browser notifications for habits reminders)
- Privacy settings (local-only vs synced data preference)
- Data import (restore from JSON backup)

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
| Studio: Anthropic-only or multi-provider? | Open | Add GroqCloud/Gemini/OpenRouter as free alternatives in S6; user selects provider in Settings |
