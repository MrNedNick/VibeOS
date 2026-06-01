# Roadmap

> Re-planned v2 2026-05-27 · v3 2026-05-28 · v4–v7 2026-05-30 · v8 2026-05-31 S8 formalised · **v9 2026-05-31 S9 Phase 3 complete, Phase 4 specced, next-chat instructions added.**
> ⚠️ **Keep this file current.** Mark sprint items done the moment they ship. Add Phase 4+ specs before the session that implements them. A roadmap that lags the code is useless.
> See `docs/strategy.md` for product context · `docs/privacy-security.md` for auth plan.

---

## Sprint status overview

| Sprint | Goal | Status |
|--------|------|--------|
| S1 — Identity | Life OS first impression | ✅ complete |
| S2 — Command Center | Dashboard as daily command center | ✅ complete |
| S3 — Backend + Auth | Real product, private data | ⏸ paused — code done, awaiting Supabase credentials |
| S4 — Core Life Modules | Goals + task unification | ✅ complete |
| S5 — Life Depth | Learning + Training + Analytics | ✅ complete |
| S6 — AI Integration | AI as planning layer | ✅ complete — 9 features |
| S7 — Polish | Credibility + reliability | ✅ complete — Vitest ✅, CI ✅, Lighthouse 82 ✅, a11y 100 ✅ |
| S8 — Design System | Unified component library | 🔄 active — items 1–3 ✅, item 4 (/ui-kit page) ❌ |
| **S9 — Full Redesign** | Premium visual identity | ✅ **complete** — v0.9.x |
| **S10 — Vibe-pak Consolidation** | 4 clean paks, Revolut + CRT redesign | ✅ **complete** — v1.0.x |
| **S11 — Welcome & Positioning** | "Simple Notion for life, where everything is connected" + live cascade demo | 🔜 **next** — repositioned 2026-06-01 |
| **S12 — AI Depth** | AI in every module; start with Analytics monthly report (shows connected data) | 🔜 planned — analysis-first sprint |
| **S13 — Design Pass** | Module-by-module quality pass | 🔜 planned — requires live review with user |
| **S14 — Quick Wins** | Lazy routes, README refresh, soft-delete before sync, hex cleanup | 🔜 planned — small independent tasks |

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

## S7 — Polish & Testing ✅ complete (v1.0.4–v1.0.7)

- ✅ **Vitest + Vue Test Utils** — 59 tests across 5 files (v1.0.4)
  - `goals.types.test.ts` — calcProgress (7 cases), daysUntil (3 cases)
  - `learning.types.test.ts` — calcProgress (6), calcStreak (5), calcHoursLogged (4)
  - `tasks.types.test.ts` — classifyTaskDueDate (4 cases)
  - `goals.store.test.ts` — CRUD, computed lists, milestones, getProgress (16 cases)
  - `tasks.store.test.ts` — management, status filter, category filter, counts (19 cases)
  - Environment: `happy-dom` (avoids jsdom ESM compat issue with Node 20)
  - Config: `vitest.config.ts` — globals: true, @ alias
  - Scripts: `npm test` (run once) · `npm run test:watch` (dev)
- ✅ **CI gate** — `test` job runs type-check + tests before build; deploy blocked on failure (v1.0.4)
- ✅ **Lighthouse audit** — Performance 82, Accessibility 100, Best Practices 100, SEO 82 (v1.0.5)
  - Audited via CLI against vite preview build; all scores above target thresholds
  - Color-contrast fixes: `not-found__code` (#d7dbe8→#7a8099), `not-found__sub` (muted→secondary), bottom-nav labels (contrast + font-weight 500→600)
- ✅ **a11y audit** — keyboard nav ✅, focus rings ✅ (global focus-visible), ARIA labels ✅ (v1.0.6)
  - Added `aria-label` to sidebar `<aside>` and `<nav>`, `aria-current="page"` on active nav items
  - Added `aria-label` to bottom nav `<nav>` and "All modules" sheet dialog
- ✅ **Error boundaries** — all module routes wrapped; graceful fallback UI
- **Preview deploys per PR** — Vercel free tier (deferred — not blocking)
- ✅ **Bundle size badge** in README — 528 kB gzip total, shields.io static badge (v1.0.7)

---

## S8 — Design System ✅ (complete — v0.8.x)

**Goal:** every UI component lives in one place; the app can be fully restyled by editing `@/ui` alone. Deliver a live `/ui-kit` component catalogue so every future design iteration is fast and visible.

**Why this sprint must come before full redesign (S9):** Without a unified component system, a visual overhaul requires touching 15+ files for every style change. S8 is the architectural prerequisite.

**Order (each item is a focused session):**

1. **Skeleton loaders — `UiSkeleton.vue`** ✅ complete
   - `UiSkeleton.vue` in `@/ui` with shimmer animation, `width/height/rounded` props
   - Applied to WeatherWidget, DigestWidget, GitHubWidget — eliminates layout shift on load
   - Convention: all async widgets use `UiSkeleton`

2. **Configurable Dashboard widgets** ✅ complete
   - `WidgetConfig[]` type + `useWidgetsStore` with `useStorage('platform:dashboard:widgets')`
   - Dashboard renders widgets by `order`, filtered by `visible`
   - "Widgets" button in header → `DashboardWidgetCustomizer.vue` (drag-to-reorder + eye toggle + reset)
   - All widget cards normalized to `min-height: 148px`

3. **Unified component architecture audit** ✅ complete
   - Scan all modules for one-off UI patterns: `.cat-chip`, `.section-label`, `.form-btn`, card containers, stat displays, progress bars, filter chip rows, empty states, form field wrappers
   - Extract each to `@/ui` with typed props: `UiCard`, `UiSectionLabel`, `UiStat`, `UiProgressBar`, `UiFilterChips`, `UiEmptyState`, `UiField`, `UiModal`
   - Refactor modules to use `@/ui` imports (one module per session to keep sessions short)
   - Goal: changing a component style = editing one file in `@/ui`
   - **Before starting:** use Claude in Chrome to scan all views and catalog every unique one-off pattern
   - **✅ Phase 3 complete (v0.8.4):** Analytics, Finance, Tasks, Goals, Learning, Training, Dashboard, Habits all migrated — section labels → UiSectionLabel, progress bars → UiProgressBar, stats → UiStat, filter chips → UiFilterChips, card containers → UiCard

4. **`/ui-kit` component library page** ← LARGE TASK, multi-session
   - Route: `/ui-kit` — accessible from Settings → Developer (hidden in production)
   - Structure: left sidebar with categories, main area with live component cards (example + code snippet + prop table)
   - Theme switcher at top: preview all 6 vibe-paks at once
   - Categories: Colors, Typography, Spacing, Shadows/Elevation, Motion, Inputs, Feedback, Data Display, Navigation, Layout
   - Documents every `@/ui` component + all design tokens
   - **Reference:** `docs/design-system-reference.md` — use Claude in Chrome to analyze the reference before implementation; plan the exact structure before writing code
   - **✅ Reference analysis complete** — see `docs/ui-kit-plan.md` for full sidebar structure, component card pattern, prop table format, implementation sequence, and technical notes
   - **Prerequisite:** items 1–3 should be done first so there are components to document

5. **Design token extension** (in `main.css`) ✅ complete (v0.8.5)
   - Full elevation system: `--shadow-0` through `--shadow-4` (+ per-theme overrides for all 5 vibe-paks)
   - Typography line-height scale: `--leading-2xs` through `--leading-3xl` (9 tokens)
   - Motion tokens: `--ease-smooth`, `--duration-fast`, `--duration-base`, `--duration-slow`
   - Extended surface palette: `--color-surface-0/1/2/3` (+ per-theme overrides)
   - `@/ui` components updated: UiBadge, UiButton, UiConfirmDialog, UiEmptyState, UiInput, UiPlannedView

---

## S9 — Full Redesign 🔜 ACTIVE (v0.9.x)

**Goal:** premium visual identity — Revolut/Linear/Raycast aesthetic. Requires S8 component system to be in place (✅ S8 complete).

**Key constraint:** all style changes go through `@/ui` and `main.css` tokens only. No per-module style surgery.

**Phase 1 — Visual Foundation** ✅ complete (v0.9.0)
- Sidebar: Linear-style left-border active indicator (`box-shadow: inset 2.5px 0 0 var(--color-accent)`)
- UiCard: default `--shadow-1` on raised surface, hover → `--shadow-2`, press → `--shadow-0`
- UiButton primary: glow on hover (`color-mix` accent shadow), press state with `translateY(1px)`
- Typography: `text-rendering: optimizeLegibility` + `font-feature-settings: rlig/calt` on body
- Token migrations: sidebar, header font-size values → design tokens

**Phase 2 — Component Restyle** ✅ complete (v0.9.1)
- UiInput: высота 38→40px, hover-border, focus-glow через `color-mix`, placeholder opacity
- UiSectionLabel: font-weight 700→500, letter-spacing 0.08→0.06em (менее агрессивно)
- AppHeader search: padding 5→6px, border-radius sm→md, gap 7→8px, font-size xs→sm, hover с accent-tinted bg
- Dashboard: gap 24→20px, life-stat карточки — shadow-1 по умолчанию + shadow-2 on hover
- platform-notes.ts: полная актуализация всех модулей, TECH_DEBT, PLATFORM_STATUS

**Phase 3 — Module-by-module pass** ✅ in progress (v0.9.2+)
- ✅ Dashboard — life-stat padding+shadow-2 hover, mod-row color-mix hover, workspace gap 20px, detail panel shadow-1 + rounded-lg
- ✅ Goals — GoalCard surface raised + shadow-1, GoalsView gap 32px, GoalDetailView sections gap 28px, embedded panels shadow-1
- ✅ Habits — HabitsView #f59e0b → --color-warning everywhere, weekly summary shadow-1, HabitCard shadow-1+done-shadow-2, emoji 30px, padding bumped
- ✅ Tasks — title font-weight 700, heatmap panel + AI card surface-elevated + shadow-1 + more padding, TaskItem padding 11px 14px + color-mix hover + rgba→color-mix category badges
- ✅ Learning + Training — PlanCards: shadow-sm→shadow-1 base + shadow-2 hover + border tint, gap 16px, bar 5px; empty-icon hardcoded hex → CSS vars
- ✅ Notes — goal-icon #f59e0b → --color-warning, NoteListItem padding 11px/16px + color-mix hover
- ✅ About — full portfolio page rewrite: hero card, "What I'm good at" skill cards, VibeOS section with decisions table, stats, modules list, language chips with levels

**Phase 4 — Vibe-paks v2** ✅ complete (v0.9.4–v0.9.9)

Each vibe-pak needs to be audited and updated to fully use the S8/S9 token system.

**Problem:** most vibe-paks define `--shadow-1..4` but the values don't match their mood:
- **Synthwave** — shadows should glow in accent color (currently just black opacity)
- **Soft Glass** — shadows should use `backdrop-filter blur` and very subtle opacity
- **CRT Retro** — shadows should use phosphor green glow, not black
- **Brutalist** — shadows should be sharp 2px offset without blur (flat design)
- **Light** — shadows should be crisp blue-grey, not the default dark opacity

**Per-pak audit order:**
1. ✅ **Synthwave** — layered glow (bloom + depth drop), --hover-tint-pct 10%, surface-1..3 bumped brighter (v0.9.4)
2. ✅ **Soft Glass** — two-layer accent-blue glass shadow, --hover-tint-pct 6%, aligned with backdrop-filter (v0.9.5)
3. ✅ **CRT Retro** — stronger phosphor glow (inner halo + outer bloom), --hover-tint-pct 8%, clearer surface hierarchy (v0.9.6)
4. ✅ **Brutalist** — strict 2px-step offset progression (0/2/4/6/8px), --hover-tint-pct 0% (snap-invert handled via !important), surface-3 darker for depth (v0.9.7)
5. ✅ **Light** — crisp blue-grey shadows (accent-tinted, no black opacity), --hover-tint-pct 4% for subtle polished feel (v0.9.8)
6. ✅ **Dark** — shadow-2 gets subtle accent tint (0.07 blue), --hover-tint-pct 7% via :root default (v0.9.9)

**What to change per pak:**
- `--shadow-1..4` values that match the pak's mood (glow, flat, crisp, none)
- `--color-surface-0..3` stacking — ensure cards visually pop from bg
- Hover state tints — `color-mix` accent percentages match pak energy (more aggressive for Synthwave, subtle for Light)
- Card `border-color` on hover — match pak accent

**Files to edit:** `src/assets/styles/main.css` — each `[data-theme="..."]` block.
**Test:** Switch each pak in Settings and verify Dashboard, GoalCard, HabitCard, TaskItem visually.

---

---

## S10 — Vibe-pak Consolidation + Revolut Direction 🔜 next

**Goal:** reduce from 6 paks to 4 clean, well-defined identities. Drop Synthwave (too niche). Merge Light + Soft Glass into a single, better Light. Push Dark and Light toward the Revolut/Linear premium aesthetic. Redesign CRT Retro with eye-friendly colors.

**Result:** 4 paks that are actually distinct, maintainable, and visually intentional.

| Pak | Status | Direction |
|-----|--------|-----------|
| **Dark** | keep + restyle | Revolut direction — deep navy, not pure black |
| **Light** | merge + restyle | Soft Glass bg + distinct header + Revolut polish |
| **Brutalist** | keep as-is | Already clean, no changes needed |
| **CRT Retro** | redesign | New color palette — eye-friendly terminal |
| ~~Synthwave~~ | ✅ removed (v1.0.0) | Deleted from CSS, types, i18n, UI |
| ~~Soft Glass~~ | ✅ merged into Light (v1.0.0) | Frosted bg + distinct header now in Light |

---

### T1 — Remove Synthwave pak ✅ (v1.0.0)

**Scope:** CSS + TS type + Settings + CommandPalette  
**Complexity:** low — pure deletion

- `main.css`: delete entire `[data-theme='synthwave']` block + the two rule groups below it (focus/active glow rules)
- `ui.store.ts`: remove `'synthwave'` from `Theme` type union; remove `'synthwave'` from `isDark` computed
- `SettingsView.vue`: remove Synthwave entry from `VIBE_PAKS` array
- `CommandPalette.vue`: remove Synthwave entry from themes list
- `SettingsView.vue` (or store init): if stored theme === 'synthwave', reset to 'dark'
- i18n: remove `settings.themeSynthwave` + `palette.themeSynthwave` translation keys in all locale files

---

### T2 — Merge Soft Glass → Light (new unified Light pak) ✅ (v1.0.0)

**Scope:** CSS redesign of `[data-theme='light']`, removal of `[data-theme='softglass']`  
**Complexity:** medium — two blocks become one, design decisions needed

**What Light inherits from Soft Glass:**
- Background: `#eef1f7` (warm off-white — better than the current flat `#f0f0f5`)
- Surface approach: translucent/frosted cards (`rgba(255,255,255,0.82)` instead of flat `#ffffff`)
- `backdrop-filter: blur(16px)` on sidebar + header — keeps the glass aesthetic alive
- Slightly larger radii (`--radius: 10px, --radius-lg: 14px`)

**What Light adds / fixes:**
- **Header MUST be distinct from bg** — current Soft Glass header bleeds into background
  - Fix: header bg `rgba(255, 255, 255, 0.92)` with a clear `border-bottom: 1px solid rgba(180, 185, 210, 0.4)`
  - Or: a slightly darker solid bg like `#dde2ec` — clearly separated
- **Revolut-direction polish:** cleaner border colors, tighter spacing feel, more contrast between surfaces
- Blue accent `#2563eb` (current Light) or adjust to `#3b5bdb` (slightly deeper, more premium)
- `--hover-tint-pct: 4%` (keep subtle)
- `--color-surface-3` clearly distinct from surface-2 for modal/panel elevation

**After merge:**
- Delete `[data-theme='softglass']` entire block from `main.css`
- Remove Soft Glass from `ui.store.ts` Theme type
- Remove from `SettingsView.vue` VIBE_PAKS
- Remove from `CommandPalette.vue` themes list
- localStorage migration: if stored theme === 'softglass', reset to 'light'

---

### T3 — Dark pak: Revolut direction ✅ (v1.0.1)

**Scope:** `:root` CSS redesign (the default/dark theme)  
**Complexity:** medium — affects entire app feel

**Problems with current Dark:**
- Background `#0a0a0a` is pure black — feels "developer terminal" not "premium app"
- Surfaces are flat grey with minimal personality
- Accent `#4f8ef7` is a generic blue — not distinctive enough
- Borders `#2a2a30` have zero warmth

**Revolut-direction changes:**
- Background: `#0b0f1a` or `#0d1117` — deep navy, not pure black; subtle blue undertone
- Surface-0: `#0b0f1a` (= bg)
- Surface-1: `#131b28` — dark navy card
- Surface-2: `#1a2436` — elevated panel
- Surface-3: `#212e42` — modal/drawer
- Border: `#1e2d42` / border-subtle: `#162030` — cool blue-grey borders, not flat dark grey
- Accent: Consider shifting to `#5c7cfa` (Revolut indigo-adjacent) or keep `#4f8ef7` but verify contrast
- `--hover-tint-pct`: maybe raise to 8% (deeper color = more visible tint needed)
- Shadow-2: remove the accent micro-tint (added in Phase 4) — replace with proper navy depth

**Must verify after change:** all modules on Dark theme still readable — especially text contrast on new navy surfaces.

---

### T4 — CRT Retro: color analysis + redesign ✅ (v1.0.2, palette C — Muted Phosphor Green)

**Scope:** `[data-theme='crt']` CSS redesign  
**Complexity:** medium — needs palette decision first

**Problem with current CRT:**
- `#00e040` phosphor green on `#030b03` near-black = eye strain for long sessions
- Pure monospace stack (`'Courier New'`) makes the UI feel broken/retro in a bad way
- The "retro" feel is there but readability suffers
- Surface hierarchy #030b03 → #091509 is barely noticeable

**Palette options to analyze (choose one before implementing):**

| Option | Bg | Accent | Text | Feel |
|--------|-----|--------|------|------|
| A — Amber DOS | `#1a1200` | `#ffb347` | `#ffd080` | warm, readable, classic |
| B — IBM Blue Phosphor | `#001428` | `#4fc3f7` | `#b3e5fc` | cool, tech, sharp |
| C — Soft Green (muted phosphor) | `#091209` | `#52c46a` | `#a8d8a8` | same vibe, much easier on eyes |
| D — Amber-Green hybrid | `#0f1208` | `#a3d977` | `#c8e6a0` | yellow-green, readable, fresh |

**Analysis questions to answer before implementing:**
1. Should font stay monospace? (authentic terminal) or switch to mixed (sans body, mono code)?
2. Should scan-line overlay stay? (it adds authenticity but hurts readability at high DPI)
3. What differentiates CRT from Dark — enough contrast in identity?

**After analysis:** pick palette, implement all tokens, verify Dashboard + Notes (text-heavy) readability.

---

### T5 — Code cleanup: 4-pak system ✅ (v1.0.3)

**Scope:** TS types, i18n, Settings UI, CommandPalette  
**Complexity:** low — bookkeeping after T1+T2+T3+T4 are done

- `ui.store.ts`: `Theme = 'dark' | 'light' | 'brutalist' | 'crt'`
- `isDark` computed: `theme === 'dark' || theme === 'crt'`
- `SettingsView.vue`: 4-entry VIBE_PAKS with updated swatches for new Dark and Light
- `CommandPalette.vue`: 4-entry theme list
- i18n EN+RU: add/update keys for new pak names if renamed; remove deleted pak keys
- Settings pak-card grid: 4 cards — verify layout looks right (currently 6 = 2 rows of 3; 4 = 1 row of 4 or 2×2)

---

### Execution order

```
T1 (Remove Synthwave) → T2 (Merge Light+SoftGlass) → T3 (Dark redesign)
                      → T4 (CRT analysis first, then implement)
                      → T5 (cleanup — last, after all paks final)
```

T1 and T2 can be done in one session.  
T3 (Dark) should be done after Light is final — so Dark/Light contrast can be compared.  
T4 needs the analysis conversation first — user chooses palette direction, then implement.

---

## S11 — Welcome Page & Positioning 🔜 planned

**Goal:** position VibeOS as a **simple, lightweight Notion alternative for your life — where everything is connected.** The welcome page must, in 10 seconds, make a friend (or recruiter) understand: this is a clean, no-setup daily tool, and one action updates everything across modules.

**Audience (re-decided 2026-06-01):** primary user is the owner + friends who want a simpler-than-Notion daily tool ("open the link, do your habits/notes/tasks, get more effective"). Recruiter is a welcome bonus, not the main target. So copy should sound like a personal tool you'd share with a friend — not a SaaS pitch, not a portfolio brag.

**Why this sprint matters:** two real strengths are currently invisible on the welcome page —
1. **Simplicity** — "open it and use it, no setup like Notion."
2. **Everything connected** — log a workout → linked habit checks off → linked goal advances, automatically. This auto-cascade is the one thing you can't rebuild from Notion/Todoist/Obsidian in an hour, and it's the whole story. It's implemented (`training.store.ts`, `habits.store.ts`) but shown nowhere.

**Dropped:** the "life efficiency accelerator" framing — too marketing-y for a personal tool. We do not lead with a category metaphor ("OS" / "accelerator"); we lead with the mechanism.

---

### T1 — Positioning update

**Scope:** copy everywhere the product describes itself  
**Complexity:** medium — many touch points, requires consistency

**Current:** "A personal life operating system"  
**New direction:** "A simpler Notion for your life — everything connected."

**Touch points to update:**
- `WelcomeView.vue` — hero headline + subheadline + feature section copy
- `README.md` — tagline + "What it is" section (also fix stale sprint table — see S14 T2)
- `AboutView.vue` — VibeOS description block
- `docs/strategy.md` — §3 product positioning section
- `<title>` and `<meta description>` in `index.html`

**Tone:** like recommending your own tool to a friend. Plain, light, honest. "Open it, do your habits, see your goals move." Not corporate, not a buzzword pitch.

**✅ Copy decisions locked (2026-06-01 — replaces 2026-05-31 "accelerator" copy):**

**Eyebrow:** `"A simpler Notion — for your life"`

**Headline:** `"Log one thing. Everything updates."`
> Describes the actual mechanism (the auto-cascade), is literally true, and is provable in the demo in 10 seconds. This is the one thing Notion can't do without manual setup.

**Subheadline:** `"Habits, tasks, goals, learning — in one light, no-setup place. Check off a habit and your goal moves on its own."`
> Leads with simplicity + the cascade. No "feedback loop" jargon.

**3 feature pillars:**
1. icon: Link2 — **"Everything connected"** — *"Log a workout, the habit checks off and the goal advances — automatically. No manual linking."*
2. icon: Feather — **"Light by design"** — *"No databases to configure, no templates to wrestle. Open it and use it."*
3. icon: Sparkles — **"AI that knows your data"** — *"Ask anything — your goals, habits, and tasks are already loaded. Free, no key required."*

**CTA buttons:** `"Open VibeOS"` (primary, accent) + `"View on GitHub"` (ghost, links to GitHub)
> "Open" not "Try" — it's your own tool, not a vendor's demo.

**⭐ Hero visual — THE key element (do this well, it carries the whole page):**
- A small **live, interactive cascade demo** on seeded fake data — NOT a static animated stats card.
- One clickable habit row: when clicked, a linked goal's progress ring visibly ticks up. Caption: *"Go ahead — check it off."*
- This is the single most convincing thing on the page. It shows the differentiator instead of claiming it. Everything else is secondary.

**Additional design decisions:**
- Remove terminal preview tab — not a conversion argument; move CRT pak into vibe-paks section
- Stats strip: `"16 modules"` · `"No setup needed"` · `"100% local-first"` · `"No subscription. Ever."`
- Add Vibe-paks section: 4 swatches (Dark / Light / Brutalist / CRT) side-by-side with accent color preview
- Replace current "OS-first thinking" pillar with the 3 new pillars above
- Remove "Your data, only yours" as its own pillar — absorb into stats strip + final CTA
- Fix S9 violation while here: WelcomeView hardcodes hex (`#4f8ef7`, the `MODULES` color array) — replace with `var(--color-accent)` / module accent vars (see S14 T4)

---

### T2 — Welcome page premium redesign

**Scope:** `src/modules/welcome/WelcomeView.vue` — full redesign  
**Complexity:** high — design-heavy, multi-section landing page

**Goal:** a friend or visitor lands here and in 10 seconds understands: *this is a clean, simple daily tool, and one action updates everything.* Conversion target: they click "Open VibeOS" and try the live cascade.

**Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  NAV — logo + GitHub + "Sign in" + "Open VibeOS" (minimal)      │
├─────────────────────────────────────────────────────────────────┤
│  HERO — full viewport height, 2-column on desktop              │
│  LEFT: eyebrow → headline (big) → sub → 2 CTAs                  │
│  Eyebrow: "A simpler Notion — for your life"                    │
│  Headline: "Log one thing. Everything updates."                 │
│  Sub: "Habits, tasks, goals, learning — in one light, no-setup  │
│       place. Check off a habit and your goal moves on its own." │
│  CTA 1: "Open VibeOS" (primary, accent, ArrowRight icon)        │
│  CTA 2: "View on GitHub" (ghost, Github icon)                   │
│  RIGHT: ⭐ LIVE INTERACTIVE CASCADE (the key element)            │
│    clickable habit row → linked goal ring ticks up on click     │
│    seeded fake data, caption "Go ahead — check it off."         │
│    (NOT a static animated stats card — it must actually react)  │
├─────────────────────────────────────────────────────────────────┤
│  PROOF STRIP — 4 bordered stat chips, single row                │
│  "16 modules" · "No setup needed"                               │
│  "100% local-first" · "No subscription. Ever."                  │
├─────────────────────────────────────────────────────────────────┤
│  3 FEATURE PILLARS — icon + headline + 2-line copy              │
│  Link2: "Everything connected"                                  │
│  Feather: "Light by design"                                     │
│  Sparkles: "AI that knows your data"                            │
├─────────────────────────────────────────────────────────────────┤
│  MODULE GRID — 12 cards, 4-column, icon + name + 1-line desc    │
│  (keep from current — good content, needs visual polish only)   │
├─────────────────────────────────────────────────────────────────┤
│  VIBE-PAKS — "4 visual identities"                              │
│  4 pak cards side-by-side: name + accent swatch + bg preview    │
│  Dark / Light / Brutalist / CRT                                 │
├─────────────────────────────────────────────────────────────────┤
│  FINAL CTA — "Your data stays in your browser. Always."         │
│  "Open VibeOS" button centred + one-line privacy note           │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER — stack pills + GitHub link + version                   │
└─────────────────────────────────────────────────────────────────┘
```

**Visual direction:** premium dark-first (matches Dark pak). Same S9 tokens — no new CSS primitives. Generous whitespace, `clamp()` type sizes, gradient accent glow on hero headline via `color-mix`. No stock imagery — use fake-but-realistic app data as the visual.

**What to remove from current page:**
- Terminal preview tab section — not a conversion argument
- "OS-first thinking" and "Vibe-paks" pillars — replaced by new 3 pillars
- "Your data, only yours" as standalone pillar — folded into proof strip + final CTA

---

## S12 — AI Depth: Every Module 🔜 planned

**Goal:** every module that touches user data gets at least one meaningful AI action. Current coverage: Goals ✅ · Tasks ✅ · Learning ✅ · Training ✅ · Dashboard ✅. Remaining: Habits ❌ · Notes ❌ · Finance ❌ · Analytics ❌.

**Architecture:** `useAI()` composable already exists (`src/core/composables/useAI.ts`). Pattern: user-initiated button → loading state → dismissable result card. Free via Pollinations.ai, no key needed.

**Pre-session analysis required** — Claude must read each module's store + view before implementing. The AI prompt must be grounded in real data structures.

---

### T1 — Habits AI: "Pattern insights"

**What:** after user opens HabitsView or clicks "✦ Analyse" button → AI reads:  
- Habit names, categories, current streaks, best streaks
- Check-in pattern (last 14 days — which days are consistently missed)
- Correlation hints (which habits cluster by completion day)

**Output:** 2–3 insight bullets, e.g.:
- "You consistently skip Exercise on Wednesdays and Sundays — consider lowering frequency."
- "Your best streaks are in the Learning category — you're building momentum there."
- "Read 15 min and Meditate are completed together 80% of the time — they reinforce each other."

**UI:** collapsible "✦ Pattern insights" card at top of HabitsView, generated on demand.

**Prompt structure:** inject last 14 days of per-habit check data + streaks. Ask for 2–3 observations. No generic advice — only observations grounded in the provided data.

---

### T2 — Notes AI: "Summarise + extract"

**What:** two buttons in NotesView toolbar (visible when a note is open and has >200 chars):
1. **"✦ Summarise"** → distils note into 3–5 bullet points
2. **"✦ Action items"** → extracts todos/next steps from the note text

**Output:** appears as a floating card below the editor (doesn't replace note content).

**Edge cases:** empty note → button hidden. Short note (<200 chars) → button hidden. AI card is dismissable and not persisted.

**Prompt:** pass the raw note markdown. Ask for bullets only, no preamble.

---

### T3 — Finance AI: "Spending analysis"

**What:** "✦ Analyse spending" button in FinanceView Overview tab → AI reads:
- Current month expenses by category (total per category)
- Budget limits per category (if set)
- Over-budget categories
- Biggest single expenses

**Output:** 3–4 observations + 1–2 actionable suggestions, e.g.:
- "Food accounts for 38% of this month's spending — your highest category."
- "Transport is over budget by €42. Consider if any trips can be combined."
- "You have no expenses logged in Savings this month."

**Prompt:** inject structured spending summary (categories + amounts + budget limits). Responses in the same currency as the user's data.

---

### T4 — Analytics AI: "Monthly report"

**What:** "✦ Generate monthly report" button in AnalyticsView → reads ALL module data for the selected period and produces a narrative summary:
- Habit consistency %
- Tasks completed vs created
- Learning hours logged
- Training sessions
- Goals progress

**Output:** 1 paragraph narrative, like a personal review. E.g.: "This month you completed 87% of your habits, your best result in 3 months. You logged 12 hours of learning across 2 plans, and your Fitness goal moved from 40% to 65%. Your main gap was tasks: 43% completion rate, down from last month."

**This is the highest-value AI feature** — it synthesises across all modules and gives the user a real reflection of their month.

---

### Implementation notes

- All features use `useAI()` — same pattern as existing integrations
- All are **user-initiated** — no automatic runs
- All results are **dismissable** — no persistent AI output
- All prompts pass **only data from the user's current session** — no cross-session context
- Test each feature manually: empty state → loading → result → dismiss

---

## S13 — Design Pass 🔜 planned (requires user decisions)

**Goal:** quality pass on modules that haven't been touched since S9. User reviews current state of each module and flags what feels off — spacing, hierarchy, color use, empty states, mobile layout.

**Why deferred:** design decisions require the user's eye on the actual running app. This sprint can't be planned purely from code — it needs a live walkthrough session first.

**Pre-session process:**
1. User opens the live app on MacBook (lg breakpoint) and iPhone (sm breakpoint)
2. User notes which modules feel visually weak or inconsistent
3. User brings specific screenshots or descriptions to the session
4. Claude implements the agreed changes

**Candidate modules (likely need work):**
- **Finance** — known UX issues from roadmap backlog; dense layout
- **Board** — Kanban/Timeline haven't been touched since S4
- **Studio** — chat interface was shipped fast; layout may feel unpolished
- **Analytics** — charts are functional but visually basic
- **Calendar** — month grid works but right-panel layout needs review

**Constraint:** all changes must follow S9 visual rules (color-mix, --shadow-*, --leading-*, UiCard for containers). No new CSS primitives.

> ⚠️ **Start this sprint with a live review conversation, not with code.** User provides direction, Claude implements. Wrong order = wrong result.

---

## S14 — Quick Wins 🔜 planned (small independent tasks)

**Goal:** small, high-value fixes that came out of the 2026-06-01 architecture + positioning review. Each is independent and can ship in its own commit. None require a design session or user decisions.

---

### T1 — Lazy-load module routes ⚡ ✅ (v1.0.8)

**Done:** the 4 remaining static module views (Studio, Settings, About, Board) converted to `() => import(...)` (the rest were already lazy). Added `build.rollupOptions.output.manualChunks` splitting `marked`, `highlight.js`, and `lucide-vue-next` (icons) into their own chunks. Initial entry chunk `index.js` dropped from **264.84 → 45.52 kB gzip**; module code (Games/Studio/Analytics/etc.) is no longer in the initial bundle. The `icons` chunk is large (≈188 kB gzip) because `UiIcon` resolves icons by string at runtime (`import *`) — now isolated into its own cacheable chunk. README badge updated to the new initial-JS figure.

**Problem:** `src/router/index.ts` imports all 16 modules statically — Games (Tetris/Snake/Sudoku/etc.), Studio, charts, `highlight.js`, `marked` all land in one `index.js` chunk. The `/welcome` page (first thing a friend/recruiter sees) ships the code for Tetris.

**Fix:** convert module route components to dynamic `() => import(...)`. Welcome must load near-empty. Obvious split points: Games, Studio, Analytics, Finance.

**Do NOT** lazy-load Pinia stores — they're tiny, it adds complexity for no gain.

**Verify:** `npm run build` — confirm multiple chunks + smaller initial bundle; welcome still loads.

---

### T2 — Refresh README.md 📄

**Problem:** README is badly stale — it's the first thing seen on GitHub. It still says "S1 active", lists the removed **Snippets** module, and marks Goals/Learning/Training as "planned" (all shipped).

**Fix:**
- Tagline + "What it is" → new positioning ("a simpler Notion for your life, everything connected"; lead with the cascade).
- Module table → actual 16 shipped modules; remove Snippets.
- Sprint table → current state (S1–S10 ✅, S11 next).
- Keep it short and honest.

---

### T3 — Soft-delete (tombstones) before Supabase sync ⚠️

**Problem:** each module stores one JSON array under one key; `useCloudSync._merge()` unions records by id with last-write-wins on `updated_at`. There are **no tombstones**, so a record deleted on device A reappears after merge with device B (it's just "missing" from one array, not marked deleted). Deletes will silently come back once sync is on.

**Fix (do before resuming S3):**
- Add `deletedAt?: number` to synced entities; filter deleted items out of UI lists.
- Pass tombstones through `_merge` so a delete wins over an older edit.
- Physically drop tombstoned rows in a later GC pass (not urgent).

**Scope:** `useStorage`/entity types + `useCloudSync.ts`. Not needed until S3 unpauses, but it's a prerequisite — log it now so it isn't forgotten.

---

### T4 — Hex cleanup + lint guard 🎨

**Problem:** `WelcomeView.vue` (and a few spots) hardcode hex like `#4f8ef7` and a per-module `color` array — direct violations of the S9 "no hardcoded hex" rule. The rule isn't enforced, so it leaks.

**Fix:**
- Replace hardcoded hex with `var(--color-accent)` and per-module accent vars.
- Add a stylelint rule (or simple CI grep) banning hex outside `main.css`, wired into the existing CI gate so it can't regress.

---

### T5 — Single AI provider seam 🔌 (optional, low urgency)

**Problem:** the Pollinations.ai endpoint + model are hardcoded in **two** places (`aiComplete()` and `useAI()` duplicate the same `fetch`). Swapping providers (Groq/Gemini, already in S6 item 10) means editing both + 9 call sites.

**Fix:** one provider module with a single `fetch`, endpoint/model from env. No fallback chain needed yet — all AI features are already optional/dismissable, so if Pollinations dies the app still fully works.

---

## ── NEXT CHAT INSTRUCTIONS ────────────────────────────────────────────

> Актуально на v1.0.7 (2026-05-31). Промпты в порядке приоритета.

---

**[СЛЕДУЮЩИЙ] Session: S8 item 4 — /ui-kit Component Library Page**

```
Сессия — S8 item 4: /ui-kit Component Library Page

Прочитай перед началом (в этом порядке):
1. /Users/test/Documents/Work/AIProjects/VibeOS/CLAUDE.md
2. /Users/test/Documents/Work/AIProjects/VibeOS/docs/roadmap.md
3. /Users/test/Documents/Work/AIProjects/VibeOS/docs/ui-kit-plan.md  ← ОБЯЗАТЕЛЬНО полностью

Контекст:
- Версия: v1.0.7
- S7 ✅ complete. S8 items 1–3 ✅. S10 ✅ (4 пака: Dark, Light, Brutalist, CRT)
- Vitest: 59 тестов, happy-dom (не jsdom)

Задача: реализовать /ui-kit component library page по плану из ui-kit-plan.md.

Структура (ui-kit-plan.md §8):
  src/modules/ui-kit/
    views/
      UiKitView.vue              ← root: sidebar + main area
      sections/tokens/           ← Colors, Typography, Spacing, Shadows, Motion
      sections/components/       ← один файл на каждый @/ui компонент
      sections/patterns/         ← UiEmptyState, UiConfirmDialog
    components/
      ShowcaseCard.vue, PropTable.vue, PgStage.vue, TokenSwatch.vue, TokenRow.vue

Решения (уже приняты):
- Route /ui-kit скрыт в production (import.meta.env.PROD)
- Сайдбар: Tokens / Components / Patterns
- Каждый компонент: Header → Playground (живой @/ui) → Prop table (Prop / Type / Purpose)
- Theme switcher в footer сайдбара — 4 пака вживую
- 15 @/ui компонентов + 5 token секций — полный список в ui-kit-plan.md §9

Порядок (коммить по блокам, +patch каждый):
1. UiKitView + сайдбар + routing + ShowcaseCard/PropTable/PgStage
2. Token pages: Colors, Typography, Spacing, Shadows, Motion
3. UiButton, UiInput, UiField, UiCard
4. UiSkeleton, UiBadge, UiIcon, UiProgressBar, UiProgressRing
5. UiStat, UiSectionLabel, UiFilterChips, UiEmptyState, UiConfirmDialog

Правила: type-check → 0, test → 59 pass, S9 visual rules (color-mix, --shadow-*, no hex)
```

---

**Session: S11 — Welcome Page & Positioning**

```
Сессия — S11: Welcome Page redesign + Positioning update

Прочитай перед началом:
1. /Users/test/Documents/Work/AIProjects/VibeOS/CLAUDE.md
2. /Users/test/Documents/Work/AIProjects/VibeOS/docs/roadmap.md  ← S11 описан там (T1+T2)
3. /Users/test/Documents/Work/AIProjects/VibeOS/docs/strategy.md  ← текущее позиционирование
4. src/modules/welcome/WelcomeView.vue  ← текущая страница (читай полностью)

Контекст: S8 ✅ complete. Версия: актуальная (смотри CLAUDE.md).

ВСЕ COPY-РЕШЕНИЯ ПРИНЯТЫ (репозиционирование 2026-06-01) — сразу реализуй.
Позиционирование: "простой Notion для жизни, где всё связано". НЕ "accelerator".
Главная аудитория — сам пользователь + друзья; рекрутёр — бонус.

Eyebrow: "A simpler Notion — for your life"
Headline: "Log one thing. Everything updates."
Subheadline: "Habits, tasks, goals, learning — in one light, no-setup place.
              Check off a habit and your goal moves on its own."
CTA buttons: "Open VibeOS" (primary) + "View on GitHub" (ghost → github.com/mrnednick/VibeOS)
3 Pillars:
  1. Link2 icon — "Everything connected"
     "Log a workout, the habit checks off and the goal advances — automatically. No manual linking."
  2. Feather icon — "Light by design"
     "No databases to configure, no templates to wrestle. Open it and use it."
  3. Sparkles icon — "AI that knows your data"
     "Ask anything — your goals, habits, and tasks are already loaded. Free, no key required."
Proof strip: "16 modules" · "No setup needed" · "100% local-first" · "No subscription. Ever."

Структура новой страницы (сверху вниз):
1. NAV — logo + GitHub link + "Sign in" + "Open VibeOS" CTA
2. HERO — 2 колонки: [LEFT] eyebrow → headline → sub → CTAs
   [RIGHT] ⭐ ЖИВОЙ ИНТЕРАКТИВНЫЙ КАСКАД (ключевой элемент, сделать хорошо):
   кликабельная строка привычки → при клике кольцо прогресса связанной цели
   реально дёргается вверх. Seeded fake data. Caption: "Go ahead — check it off."
   ЭТО НЕ статичная анимированная карточка статов — она должна реально реагировать.
   Это единственная вещь, которая показывает фишку вместо того чтобы про неё заявлять.
3. PROOF STRIP — 4 bordered stat chips
4. PILLARS — 3 карточки (Connected / Light / AI)
5. MODULE GRID — 12 cards, 4-col (переиспользуй логику из текущей страницы)
6. VIBE-PAKS — 4 pak карточки: name + accent swatch + bg color preview
7. FINAL CTA — "Your data stays in your browser. Always." + "Open VibeOS" button
8. FOOTER — stack pills + GitHub + version

Что удалить из текущей страницы:
- Terminal preview tab (welcome__preview-section целиком)
- "OS-first thinking" и "Vibe-paks" pillars
- "Your data, only yours" standalone pillar
- Захардкоженный hex (#4f8ef7, массив MODULES.color) → var(--color-accent) / module accent vars

Что обновить помимо welcome:
- docs/strategy.md §3 — новое позиционирование
- README.md — tagline + "What it is" секция
- index.html — <title> и <meta name="description">

Визуальные правила: S9 tokens, color-mix, --shadow-*, no hardcoded hex.
Правила: type-check → 0, test → 59 pass, коммит + push после каждого блока.
Версии: +patch за каждый блок.
```

---

**Session: S12 — AI Depth (Habits, Notes, Finance, Analytics)**

```
Сессия — S12: AI depth — 4 модуля

Прочитай перед началом:
1. /Users/test/Documents/Work/AIProjects/VibeOS/CLAUDE.md
2. /Users/test/Documents/Work/AIProjects/VibeOS/docs/roadmap.md  ← S12 описан там (T1–T4)
3. src/core/composables/useAI.ts  ← существующий AI composable

Контекст: S11 ✅. Версия: актуальная.
Текущее AI-покрытие: Goals ✅ Tasks ✅ Learning ✅ Training ✅ Dashboard ✅
Осталось: Habits ❌ Notes ❌ Finance ❌ Analytics ❌

ПЕРЕД КАЖДЫМ МОДУЛЕМ: прочитай store + view файлы этого модуля.
Prompt должен опираться на реальные data-структуры, не на предположения.

Паттерн (как в существующих интеграциях):
- User-initiated кнопка "✦ [action]"
- loading state через useAI().loading
- dismissable result card (не сохраняется)

Задачи в порядке приоритета:
1. Analytics — "✦ Generate monthly report" кнопка → нарратив по всем модулям за период
   (самая высокая ценность — cross-module synthesis)
2. Habits — "✦ Pattern insights" в HabitsView → 2-3 наблюдения по check-in паттернам
3. Notes — "✦ Summarise" + "✦ Action items" кнопки в toolbar когда note > 200 chars
4. Finance — "✦ Analyse spending" в Overview tab → observations + 1-2 suggestions

Детальные спецификации каждого — в roadmap.md S12 T1–T4.
Правила: type-check → 0, test → 59 pass, коммит + push после каждого модуля.
```

---

**Session: S13 — Design Pass (начинать только после live review)**

```
Сессия — S13: Design Pass

⚠️ ЭТОТ ПРОМПТ ИСПОЛЬЗОВАТЬ ТОЛЬКО ПОСЛЕ того как ты (пользователь) прошёлся
по живому приложению и написал конкретные замечания по каждому модулю.
Без конкретики от тебя — сессия не имеет смысла.

Прочитай перед началом:
1. /Users/test/Documents/Work/AIProjects/VibeOS/CLAUDE.md
2. /Users/test/Documents/Work/AIProjects/VibeOS/docs/roadmap.md  ← S13 описан там
3. /Users/test/Documents/Work/AIProjects/VibeOS/docs/conventions.md  ← S9 visual rules

Контекст: S12 ✅. Версия: актуальная.

[ЗАПОЛНИ ПЕРЕД ИСПОЛЬЗОВАНИЕМ]
Твои замечания по модулям (из live review на MacBook + iPhone):
- Finance: ???
- Board: ???
- Studio: ???
- Analytics: ???
- Другое: ???

Правила: S9 visual rules, коммит + push после каждого модуля, type-check → 0.
```

---

---

## Recently shipped (history)

### 2026-05-31 — Habit reorder + game skins + multi-currency + about (v0.7.9 → v0.8.0)

- **Habit drag-to-reorder** — HTML5 drag events on each habit row; ⠿ drag handle visible on hover; `reorderHabits(fromId, toId)` in store splices array to persist order; drag-over indicator at drop target
- **Memory card themes** — 4 emoji pools: Animals (free), Food (3 wins), Symbols (7 wins), Nature (15 wins); `totalWins` counter; unlock toast; theme picker below board; pool used when reshuffling
- **Sudoku color themes** — Classic (free), Dark @3 solved (dark cell backgrounds #1a1a2e), Pastel @7 solved (pink accents #e879a0); CSS vars via `:style`; `puzzlesSolved` counter; theme picker + unlock banner
- **Finance multi-currency** — `baseCurrency` + `displayCurrency` + `exchangeRates` in store; `fetchRates()` calls open.er-api.com free API (once per day); `convertAmount()` helper; base/display pickers in Budgets tab; converted total in header
- **About page live stats** — `MODULES` computed from `PLATFORM_MODULES` registry (Finance now included, descriptions updated for all shipped features); `STATS` computed from live stores: module count, habits tracked, tasks done, active goals

---

### 2026-05-31 — Habit UX + achievements panel + notes-goals + finance recurring (v0.7.8 → v0.7.9)

- **Habit at-risk filter** — `⚠️ At risk (N)` filter chip in HabitsView shown when any habit has streak > 2 but not yet checked today; filters list to at-risk habits only; amber styling distinct from category chips
- **Habit weekly summary** — 7-day progress bar card at top of HabitsView: completion %, total check-ins out of possible slots, current best streak; color-coded green/accent/warning based on performance
- **Achievements panel** — new Dashboard sidebar entry (🏆 Trophy) showing all 10 achievements as a 2-col grid; unlocked items highlighted in amber with checkmark; gradient progress bar; locked items greyed out; motivational footer message
- **Notes → Goals linking** — `linkedGoalId?: string` on Note type; `setNoteGoal()` and `getNotesForGoal()` in notes store; 🎯 goal selector in NotesView toolbar (shown when active goals exist); "Linked notes" section in GoalDetailView listing note titles + dates
- **Finance recurring expenses** — `recurring?: boolean` on Expense; `toggleRecurring()` + `addFromRecurring()` in store; 🔄 toggle on each transaction row (hidden until hover, visible when active); recurring section at top of Transactions tab shows known recurring expenses as quick-add chips for current month

---

### 2026-05-31 — Skip day + templates + board filter + vibe-paks + achievements (v0.7.7 → v0.7.8)

- **Habit skip day** — `skippedDates?: string[]` on Habit; `toggleSkip()` store method; `computeStreak()` updated to treat skipped days as transparent (don't break, don't count); striped CSS pattern for skipped cells in past-days calendar; right-click any past cell to toggle skip
- **Habit quick-start templates** — 5 one-click presets in empty state (Exercise 💪, Read 15 min 📖, Drink 2L water 💧, Meditate 🧘, No social media 📵); each has pre-set emoji, purpose, and category
- **Board search + priority filter** — search input filters card title + description live across all columns; 5 priority filter chips (All/High/Medium/Low/None); filtered count shown when active; filter bar hidden when board is empty
- **Soft Glass vibe-pak** — frosted glass aesthetic: translucent surfaces, backdrop-filter blur on sidebar/header, soft blue accent #4f7ef7, warm grey background #eef1f7
- **CRT Retro vibe-pak** — phosphor green terminal: #00e040 accent, near-black #030b03 background, monospace font stack, CSS scan-line overlay via `body::after`; added to Settings + Command Palette
- **Achievements system** — `achievements.store.ts` with 10 predefined milestones (Goal Setter, First Win, Note Taker, Scholar, Athlete, Goal Crusher, Player, Centurion, Consistent, Life OS); condition checked against event history; `AchievementToast.vue` slides in from bottom-right on unlock; auto-dismisses 4s; chained unlocks processed one at a time; mounted in AppLayout

---

### 2026-05-31 — Habit depth pass + Finance Dashboard widget (v0.7.6 → v0.7.7)

- **Habit categories** — `HabitCategory` type (health/productivity/learning/social/other) with color+icon meta; category picker in creation form (chip row); filter chips in HabitsView when 2+ categories in use; category icon badge on HabitCard meta row
- **Streak milestones** — `STREAK_MILESTONES = [7,14,30,60,100,180,365]`; `lastMilestone` stored per habit; `toggleToday` detects crossing a milestone and sets `milestoneHabit` reactive ref; HabitsView shows animated celebration banner, auto-dismisses after 5s
- **Longest streak + habit age** — `computeBestStreak()` in types using sorted date diff; "Best N" shown when all-time record > current streak; `habitAge()` helper; "Day N" shown after 7+ days on HabitCard
- **Check-in notes** — optional short note per day; `checkNotes: Record<string,string>` on Habit; `setCheckNote()` in store; note input appears for 6s after marking done, saves on Enter/blur; 💬 note displayed as subtitle, click to re-edit
- **Finance Dashboard widget** — `FinanceWidget.vue` in Dashboard widgets row: monthly total + budget progress bar (green/amber/red) + "X over budget" badge + top-4 spending categories with proportional bars; 3rd column above 1100px, stacked on mobile; click navigates to Finance

---

### 2026-05-31 — Habit check-ins + Training resources + Goal tasks (v0.7.5 → v0.7.6)

- **Habit retroactive check-ins** — `toggleDate(id, date)` store method (guards: future dates blocked, max 30 days back); 📅 calendar button on each HabitCard reveals a 14-day grid with toggleable cells; clicking today routes through `toggleToday`; at-risk pulsing ⚠️ badge shown when streak > 2 but not yet checked today
- **Training plan resources** — full resource library identical to Learning: article/video/book/course/podcast/other type picker; add with URL + optional title; mark-as-done toggle; delete; domain shown; persisted in plan object
- **Goal-linked tasks in GoalDetailView** — new "Tasks" section showing all tasks with `linkedGoalId = goal.id`; active/done counts; quick-add input creates task pre-linked to goal with category 'goal'; check-off works from goal view without navigating to Tasks

---

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

### Habit tracker — remaining items (most of v2 shipped in v0.7.6–v0.7.9)

All major habit depth features are shipped. Remaining items:

- **Push notifications** — browser Notifications API; end-of-day "⚠️ streak at risk" reminder (post-S8)
- **"Habit of the day" spotlight** — random unchecked habit shown prominently in Dashboard
- **Emoji picker** — richer emoji picker in habit creation (current: text input; target: grid or search)
- **Mobile check-in tap target** — bump check button to 48px min for easier mobile tap

---

### Configurable Dashboard widgets — moved to S8 sprint (item 2)
### Skeleton loaders — moved to S8 sprint (item 1)
### Component Library `/ui-kit` — moved to S8 sprint (item 4)
### Unified component architecture — moved to S8 sprint (item 3)
### Full UI Redesign — moved to S9 sprint

> All four items are now formally planned in the S8 sprint section above. See S8 for full specs.

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

### Global ConfirmDialog component ✅ (shipped v0.7.1)
`useConfirm()` + `UiConfirmDialog.vue` shipped. All modules migrated.

---

### Kanban Board card redesign ✅ (shipped v0.7.1)
Compact meta row with priority dot + due badge + source dot + hover-delete icon. Expand chevron. Done.

---

### Weather widget — built-in API key ✅ (shipped v0.7.0)
Switched to Open-Meteo (free, no key). API key field removed from Settings. Done.

---

### Reusable component system — moved to S8 sprint (item 3)

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
