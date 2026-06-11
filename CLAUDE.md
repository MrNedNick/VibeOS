# VibeOS — Project Instructions for Claude

> ⚠️ **DOCS RULE (non-negotiable):** After every sprint, feature group, or significant change — update `CLAUDE.md`, `docs/roadmap.md`, and relevant module docs in the **same commit**. Stale docs silently break future AI sessions. If you ship code without updating docs, the next session starts with wrong context.

---

## Current state

**Version: v2.7.16 — 2026-06-11**

> **Backend is LIVE.** Supabase credentials connected (user confirmed 2026-06-04). `.env.local` + GitHub Actions secrets set. S3 is no longer blocked — auth, sync, real-time all run against the live project.

> **Tests: 582 in 54 files.** v2.7.12–15 added demo-purge, sync echo-loop, merge-correctness and sanitizer suites (S28/S29).
>
> **Tests (older note): 555 in 51 files.** v2.7.11 continued **S16 T5** — `FinanceTransactions` + `FinanceBudgets` (14 cases: list/empty-state, confirm-gated delete, budget editing, currency binding). v2.7.10 started **S16 T5** (god-component children) — `BoardCard`, `HabitCardCalendar`, `HabitCardLinks` (36 cases: emits + store mutations, props-driven render). v2.7.9 added the 2 interaction-heavy teleport modals — `UiConfirmDialog` (useConfirm promise resolution) + `UiFeedbackModal` (mood→comment→thankyou flow) (11 cases — **S16 T4** now 19/22, all interactive primitives covered; remaining 3 are presentational/infra). v2.7.8 added 5 more `@/ui` component test files — `UiFab`, `UiStat`, `UiSectionLabel`, `UiProgressRing`, `UiSkeleton` (33 cases). v2.7.7 added 5 `@/ui` component test files — `UiInput`, `UiField`, `UiProgressBar`, `UiBadge`, `UiEmptyState` (43 cases). v2.7.6 added `useAiInsight.test.ts` (8 cases — completes **S16 T1**: both S15 shared composables `useSoftDeletable` + `useAiInsight` now unit-tested; mocks `aiComplete`, pins the silent-failure contract). v2.7.4 added `board.store.test.ts` (Kanban cards + card→task cascade — completes S16 T2 data-store coverage) and `useFormValidation.test.ts` (auth-form validators). S16 T2 + T3 now complete (roadmap markers were stale — commandPalette/ui/learning/training stores were already tested).
>
> **Tests: 399 in 31 files (v2.7.3).** v2.7.1 added `cascade.integration.test.ts` (7 — cross-store auto-cascade). v2.7.2 added `usePullToRefresh.test.ts` (4) + wired Dashboard pull-to-refresh to `pullAll()`. v2.7.3 added **auth.store coverage** (19 cases, Supabase mocked) and fixed a real demo-immunity bug: `onAuthStateChange` cleared ANY user on `SIGNED_OUT`/`TOKEN_REFRESHED`, so a Supabase event could wipe a local demo session (the welcome funnel sends every visitor into demo mode). Now guarded to supabase-provider sessions only.
>
> **Note (test env):** vitest loads `.env.local`, so `isSupabaseConfigured` is `true` in tests — mock `@/core/services/supabase` to exercise unconfigured branches (see `auth.store.unconfigured.test.ts`).

| Sprint | Status |
|--------|--------|
| S1–S10 | ✅ complete |
| S11 — Welcome & Positioning | ✅ **complete** — T1 ✅; T2 ✅ welcome redesign + live cascade demo + new logo (v2.7.0) |
| S12 — AI Depth | ✅ complete (v1.1.0) |
| S13 — Design Pass | 🔜 requires live review session |
| S14 — Quick Wins | ✅ complete (v1.5.5) |
| S15 — Refactor & De-dup | ✅ complete (v1.4.0) |
| S16 — Test Coverage | 🔄 T1–T6 ✅ T8 ✅; T7 QA pass pending (live review) |
| S17 — Component Unification | ✅ complete (v1.3.0) |
| S18 — Product Analytics & Feedback | ✅ **fully complete** — T11 Supabase analytics/feedback sync shipped (v2.7.5) |
| S19 — Mobile Excellence & Account | ✅ complete (v1.9.1) |
| S20 — Auth Excellence | ✅ complete — 34 E2E tests (v1.9.1) |
| S21 — Backend Architecture | ✅ complete — user_store JSONB sync, offline queue, real-time (v2.2.1) |
| S22 — UX Action Prominence | ✅ complete — UiFab + 8 modules + Dashboard onboarding (v2.0.0) |
| S23 — Tetris Improvements | ✅ complete — hold piece, line-clear flash, score history (v2.2.0) |
| S25 — Demo Mode Seeding | ✅ complete — tasks/goals/habits/notes/finance/board seeded (v2.2.0) |
| S26 — Mobile QA & Fixes | ✅ complete — keyboard/layout/scroll/FAB/modal/touch fixes (v2.2.4) |
| Studio providers | ✅ complete — Groq + Gemini Flash + OpenRouter (v2.3.0) |
| **S27 — Profile & UX Polish** | ✅ **complete** — see v2.4–v2.6 below |
| **S28 — Sync Integrity & Data Safety** | ✅ **complete** — demo-data leak, realtime echo loop, merge correctness (v2.7.12–v2.7.14) |
| **S29 — Security Hardening** | ✅ **complete** — DOMPurify on all v-html markdown (v2.7.15) |
| **S30 — Documentation Integrity** | ✅ **complete** — core docs refreshed to reality, roadmap pruned (v2.7.16) |
| **S31 — UX Fixes & Tetris Polish** | 🔜 **planned** — Sign Up button fix (critical), Sign Out placement, Tetris contrast + record animation |
| **S32 — Onboarding Module** | 🔜 **planned** — Replace demo data with interactive new-user tutorial (separate sprint) |

**S31 active (user-reported 2026-06-11). Next session: implement S31 T1–T4, then S16 T6+T8. See roadmap.md § NEXT SESSION INSTRUCTIONS.**

## New in v2.7.12–v2.7.16 (2026-06-11) — Deep audit: S28 + S29 + S30

- **S28 T1 (v2.7.12)**: demo seed never leaks into real accounts — `purgeDemoData()` on login/register/restore; `logout()` clears `SYNC_KEYS` + queue + seed flag.
- **S28 T2 (v2.7.13)**: realtime echo loop killed — identical payloads never re-pushed; no-op merges never notify the sync bus.
- **S28 T3 (v2.7.14)**: merge correctness — `updatedAt` stamps in every mutating store action; `effectiveTs` honors epoch + ISO stamps; budgets merge by `category`; **learning/training stores wired to sync (they never were)**; board cards + budgets use `deletedAt` tombstones instead of hard deletes.
- **S29 (v2.7.15)**: all 3 `v-html` sites sanitized via `sanitizeHtml()` (DOMPurify). New deps: `dompurify` (runtime), `jsdom@22` (dev, sanitizer tests only — pinned, see conventions).
- **S30 (v2.7.16)**: architecture/strategy/platform/conventions/qa-report refreshed to v2.7.x reality (backend LIVE, 22 ui components, 4 paks); roadmap's stale "NEXT CHAT INSTRUCTIONS" block pruned. **Sync invariants documented in `docs/architecture.md` § Sync invariants — read before touching sync code.**

## New in v2.7.5 (2026-06-08) — S18 T11 + S3 keep-alive

- **S18 T11 complete**: `analytics_events` + `feedback_entries` Supabase tables (migration 003). `useAnalyticsSync` composable — `syncEvents()` batch-pushes interaction events (tracks `platform:analytics:lastSyncTs`); `pushFeedbackEntry()` pushes feedback immediately. Triggered on login, session restore, and `session:end`. Demo/unauthenticated users unaffected.
- **S3 keep-alive**: `.github/workflows/keep-alive.yml` — pings Supabase REST endpoint every 3 days (cron `0 12 */3 * *`) to prevent free-tier inactivity pause.

---

## New in v2.7.0 (2026-06-04) — Welcome redesign + new logo (S11 T2)

- **New brand mark**: replaced the old `//` slashes glyph with a "connected nodes" mark — two input nodes cascade into one node below (the product story: *log one thing → everything updates*; also reads as a "V"). `public/favicon.svg` uses an indigo→violet gradient; in-app logos (sidebar, header-area, auth views, About, welcome nav) use the theme-adaptive `var(--color-accent)` version so it still recolors per vibe-pak.
- **WelcomeView full rewrite** (`src/modules/welcome/WelcomeView.vue`): 2-column hero with a ⭐ **live interactive cascade demo** — clicking the seeded "Morning run" habit toggles it done, bumps the streak 11→12, and advances the linked "Run a half-marathon" goal ring 60%→68% with a green "+8%" delta. Fully self-contained (no real stores touched). Below: proof strip (16/0/100%/∞), 3 pillars (Connected / Light / AI), 12-module grid (uniform accent-tinted icons — minimalist, no per-module hex), **4 vibe-pak preview cards** (Dark/Light/Brutalist/CRT — accurate signature colors), final privacy CTA, footer.
- **S9 hex cleanup**: removed the old hardcoded `#4f8ef7` logo + the per-module `color` hex array. All welcome colors now run on tokens; the only literal hex left is the 4 pak swatch classes (intrinsically each pak's signature colors — documented inline).
- Verified live at `lg` + `sm`, Dark + Light themes, cascade interaction works, type-check clean.

## New in v2.6.0 (2026-06-04) — Avatar, Email Change, Finance/Board Sync

- **Avatar upload**: Settings avatar button clickable → file picker → resize to 256px (canvas) → upload to Supabase Storage bucket `avatars` → store URL in `user_metadata.avatar_url`. AppHeader shows photo instead of initials. Spinner + error handling.
- **Email change**: New "Email address" section in Settings. `auth.requestEmailChange(email)` calls `sb.auth.updateUser({ email })` — Supabase sends confirmation to both current + new. Pending state shown in UI.
- **Finance + Board backend sync**: Added `platform:finance:expenses`, `platform:finance:budgets`, `platform:kanban:cards` to `SYNC_KEYS`. Both stores now have `useBackendSync` + `useSyncBus` (same pattern as habits/goals/tasks).
- **CI**: `VITE_ADMIN_EMAILS` added to GitHub Actions build env (`secrets.VITE_ADMIN_EMAILS`).

## New in v2.5.0 (2026-06-04) — Tetris Skins

- 5 skins: Classic (always), Pastel (800pts), Dark Fire (3000pts), Matrix (6000pts), Gold (10000pts)
- Board stores piece name instead of color; draw functions remap via active skin palette at render time
- Skin selector UI below board with color swatches + lock state + unlock notification banner
- Skins + unlocked list persisted in localStorage (`platform:games:tetris:skin`, `platform:games:tetris:unlocked`)

## New in v2.4.x (2026-06-04) — UX Polish Batch

**v2.4.0:**
- Dashboard: AllTasksPanel + Platform Health now **admin-only** (`auth.isAdmin`). `VITE_ADMIN_EMAILS` (comma-separated) controls access via `secrets.VITE_ADMIN_EMAILS` in CI.
- Settings: new **Dev/Admin section** (`v-if="auth.isAdmin"`) shows AllTasksPanel with full platform task data.
- `auth.initials` computed: first letter of first name + first letter of last name (e.g. "JD").
- Habit click in Today panel: navigates to `/habits` instead of toggling; check button toggles.
- Tetris: Hold panel shows `C` kbd hint + tooltip; player name shown next to best score and in history.

**v2.4.1:**
- UiFeedbackModal redesigned: emoji mood picker (😞😐😊😍) replaces NPS 0-10 scale. Per-mood comment prompts, animated thank-you with pop animation.
- Toast on feedback submit: "Feedback received — thank you! 🙏"
- Toast audit: goals (complete/delete), finance (add/delete expense), learning (log session), training (log workout), settings (export data).

**v2.4.2:**
- Dashboard panel transition: `translateX(6px)` removed from enter (was "flying loader" on reload).
- Habit spotlight: click navigates to `/habits`; separate "Check off" / "✓ Done" button toggles.
- Settings profile: first name + last name split into two inputs side-by-side; avatar uses `auth.initials`.
- AppHeader avatar uses `auth.initials` (2-letter when last name set).

**v2.4.3:**
- Tetris mobile: canvas CSS scales to 200px at ≤767px and 170px at ≤400px — fits iPhone without overflow.
- Minesweeper mobile: long-press (500ms) on cell toggles flag; hint text updated.

---

## GitHub Secrets (required for production build)

| Secret | Where set | Purpose |
|--------|-----------|---------|
| `VITE_SUPABASE_URL` | GitHub → Settings → Secrets → Actions | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | GitHub → Settings → Secrets → Actions | Supabase anon key |
| `VITE_ADMIN_EMAILS` | GitHub → Settings → Secrets → Actions | Comma-separated admin emails (e.g. `mrnednick@gmail.com`) |

Local dev: all three live in `.env.local` (never committed).

---

## Admin access

`auth.isAdmin` is a computed in `auth.store.ts` that checks `user.email` against `VITE_ADMIN_EMAILS` (split by comma, lowercased). Admin sees:
- **Dev/Admin section** in Settings → full AllTasksPanel + platform task data
- **All Tasks + Platform Health** in Dashboard sidebar

---

## Before starting any session

Read these files in order:
1. `CLAUDE.md` (this file) — rules, current state, commit process
2. `docs/roadmap.md` — active sprint detail and next tasks
3. `docs/strategy.md` — product positioning and architecture decisions
4. `docs/conventions.md` — coding conventions including S9 visual rules

---

## Auto-commit and deploy rule

After every successful implementation of a task or group of related tasks:
1. Run `npm run type-check` to verify no TypeScript errors
2. Stage the relevant files + any updated docs
3. Bump `package.json` version (see Version bump rule below)
4. Create a commit with a clear message
5. **Push to `main`** — triggers GitHub Actions deploy to `mrnednick.github.io/VibeOS`
6. **Do this automatically** — do not ask for confirmation unless the change is destructive

```
feat: short description of what was added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Prefixes: `feat:` new features · `fix:` bug fixes · `style:` visual changes · `docs:` docs only · `refactor:` refactoring.

**Push command:** `git push origin main`

Deploy live ≈ 2 minutes after push. Version in About page and Dashboard header confirms correct deploy.

---

## Docs update rule

**Every commit that ships code must also update docs if anything changed:**

| What changed | Update |
|-------------|--------|
| New feature or module | `docs/roadmap.md` (mark done) + relevant `docs/modules/*.md` |
| Visual change | `docs/roadmap.md` (mark sprint item done) |
| New convention / @/ui component | `docs/conventions.md` |
| Architecture decision | `docs/strategy.md` |
| State/version change | `CLAUDE.md` (this file) + `docs/platform.md` |

Do **not** create separate "update docs" commits. Docs go in the same commit as the code.

---

## Version bump rule

Every feature shipped and deployed:
- **Patch** (`x.y.Z+1`): small fix, visual tweak, copy change
- **Minor** (`x.Y+1.0`): new module or significant feature
- **Major** (`X.0.0`): reserved for production launch with full auth

Update `package.json` `"version"` in the same commit.

---

## Architecture & file map (key paths)

```
src/
  core/
    stores/auth.store.ts       — login/loginDemo/logout/register/updateDisplayName/updatePassword/updateAvatar/requestEmailChange/sendPasswordReset/init; isAdmin/initials computed
    stores/ui.store.ts         — sidebarOpen, mobileSidebarOpen, theme
    services/supabase.ts       — lazy Supabase singleton, isSupabaseConfigured
    composables/useStorage.ts  — localStorage reactive state
    composables/useCloudSync.ts — pullAll/pushAll/pushKey; SYNC_KEYS (tasks/habits/goals/notes/learning/training/finance/kanban)
    composables/useBackendSync.ts — debounced per-store push (800ms)
    composables/useSyncBus.ts  — pullSeq reactive; notifies stores after pullAll
    composables/useRealtimeSync.ts — Supabase Realtime on user_store
    composables/useFormValidation.ts — per-field validation
    composables/useFeatureGate.ts — subscription tier + isAdmin check
    i18n/                      — EN + RU locale files
  layouts/
    AppLayout.vue              — root shell (sidebar + header + content + bottom tabs)
    components/AppSidebar.vue  — nav + user footer
    components/AppHeader.vue   — top bar; avatar shows img if avatarUrl, else initials
    components/AppBottomTabs.vue — mobile-only bottom nav
  ui/                          — 20 components (UiButton, UiCard, UiBadge, UiInput, UiField, UiSectionLabel, UiStat, UiProgressBar, UiProgressRing, UiFilterChips, UiEmptyState, UiSkeleton, UiConfirmDialog, UiPlannedView, UiIcon, UiModal, UiIconButton, UiSelect, UiTextarea, UiToastContainer, UiFab, UiFeedbackModal)
  modules/
    auth/                      — login/register/callback/update-password views
    settings/views/SettingsView.vue — profile (first+last name, avatar upload, email change), security (password), appearance, modules, API keys, data, privacy, admin panel
    dashboard/                 — DashboardView with admin-gated AllTasksPanel + health
    games/views/
      GameTetrisView.vue       — 5 skins (Classic/Pastel/Dark Fire/Matrix/Gold), hold panel, player name in scores
      GameMinesweeperView.vue  — long-press flag on mobile
```

## Backend sync — SYNC_KEYS

> ⚠️ **Sync invariants (S28) live in `docs/architecture.md` § Sync invariants.** Key rules: stamp `updatedAt` on every mutation, tombstones not hard deletes, new SYNC_KEYS need store wiring, identical payloads are never re-pushed.

All keys synced to `user_store` Supabase table (one JSONB row per key per user):

```
platform:task-manager:tasks
platform:habits:habits
platform:goals:goals
platform:notes:notes
platform:learning:plans
platform:learning:sessions
platform:training:plans
platform:training:logs
platform:finance:expenses
platform:finance:budgets
platform:kanban:cards
```

Pattern per store: `useBackendSync(KEY)` → debounced push on watch; `useSyncBus().pullSeq` → re-read from localStorage after `pullAll()`. Demo mode uses localStorage only (no Supabase writes).

## Design system (@/ui) — 22 components

UiButton, UiCard, UiBadge, UiInput, UiField, UiSectionLabel, UiStat, UiProgressBar, UiProgressRing, UiFilterChips, UiEmptyState, UiSkeleton, UiConfirmDialog, UiPlannedView, UiIcon, UiModal, UiIconButton, UiSelect, UiTextarea, UiToastContainer, UiFab, UiFeedbackModal.

**UiIconButton aria-label:** NOT a declared prop — uses `inheritAttrs: false` + `v-bind="$attrs"`. Pass as HTML attr.

## S9 Visual rules (all new/touched UI must follow these)

- **No hardcoded hex colors.** Use CSS tokens (`--color-accent`, `--color-danger`, etc.)
- **No `rgba()` for alpha.** Use `color-mix(in srgb, var(--color-accent) 12%, transparent)`.
- **Hover states via color-mix.** Add accent tint on hover.
- **Shadows via tokens.** `--shadow-1..4` only.
- **Line-heights via tokens.** `--leading-*` only.
- **`UiCard` for all card containers.**

Full details: `docs/conventions.md` § S9 Visual Conventions.

---

## Responsive design

### Target breakpoints

| Breakpoint | Device | Width |
|------------|--------|-------|
| `xl` | Mac Studio Display 27" 5K | ≥ 1920px |
| `lg` | MacBook Pro 14"/16" (primary) | 1280–1919px |
| `md` | iPad / small laptop | 768–1279px |
| `sm` | iPhone | < 768px |

Every new component must work at `lg` and `sm` at minimum. Content max-width: `var(--content-max-width)`.

---

## General coding conventions

- Module structure: `types → store → composable → components → view`
- No new dependencies without written reason in module doc
- localStorage keys: `platform:[module-id]:[entity]`
- Full details: `docs/conventions.md`

## Tech stack

- Vue 3 + TypeScript + Vite 6
- Pinia for state, Vue Router for routing
- `marked` for markdown rendering
- `lucide-vue-next` for icons
- No CSS frameworks — scoped component CSS + global tokens in `src/assets/styles/main.css`
- `@/ui` for all shared components — import from `src/ui/index.ts`
- Supabase JS v2 — auth + user_store JSONB sync + Storage (avatars bucket)

## Testing

Vitest v4 + happy-dom (`sanitizeHtml.test.ts` runs under jsdom via `@vitest-environment` pragma). 582 tests in 54 files. `npm test` = run once. Coverage gate: stmt 35% / branch 22%. Playwright E2E: `e2e/smoke.spec.ts`. For Teleport components (UiModal) → query `document.body`, not `wrapper.find()`.
