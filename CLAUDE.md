# VibeOS — Project Instructions for Claude

> ⚠️ **DOCS RULE (non-negotiable):** After every sprint, feature group, or significant change — update `CLAUDE.md`, `docs/roadmap.md`, and relevant module docs in the **same commit**. Stale docs silently break future AI sessions. If you ship code without updating docs, the next session starts with wrong context.

---

## Current state

**Version: v2.2.4 — 2026-06-04**

> **UI Kit now lives under Docs (v1.2.0):** the live component catalogue is no longer a hidden dev-only `/ui-kit` page. It's integrated into the Docs module as three sidebar sections — **Design Tokens**, **UI Components**, **UI Patterns** — at `/docs/ui-kit/<key>` (e.g. `/docs/ui-kit/button`). Visible in production. Showcase section components live in `src/modules/ui-kit/views/sections/` and are wired in via `src/modules/docs/data/docs-registry.ts` (`DocPage.component`). `DocsView` renders the live component when a page has `component`, else markdown. This is the single source of truth for every reusable `@/ui` component and all its states.

| Sprint | Status |
|--------|--------|
| S1 — Identity | ✅ complete |
| S2 — Command Center | ✅ complete |
| S3 — Backend/Auth | ⏸ paused — code done, awaiting Supabase credentials from user |
| S4 — Core Life Modules | ✅ complete |
| S5 — Life Depth | ✅ complete |
| S6 — AI Integration | ✅ complete |
| S7 — Polish | ✅ complete — Vitest ✅, CI ✅, Lighthouse 82 ✅, a11y 100 ✅, bundle badge ✅ |
| S8 — Design System | ✅ complete — @/ui ✅, tokens ✅, skeletons ✅, widgets ✅, UI Kit catalogue ✅ — moved under Docs at `/docs/ui-kit`, visible in prod (v1.2.0) |
| S9 — Full Redesign | ✅ complete — Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅ |
| S10 — Vibe-pak Consolidation | ✅ complete — T1 ✅ T2 ✅ T3 ✅ T4 ✅ T5 ✅ |
| S11 — Welcome & Positioning | 🔄 **active** — T1 ✅ (copy+hex v1.5.1); T2 pending (requires user review session) |
| S12 — AI Depth | ✅ complete — Analytics ✅, Habits/Notes/Finance ✅ (v1.1.0) |
| S13 — Design Pass | 🔜 planned — requires live user review session |
| S14 — Quick Wins | ✅ **complete** — all tasks done (v1.5.5) |
| S15 — Refactor & De-dup | ✅ **complete** — all tasks done (v1.4.0) |
| S16 — Test Coverage | 🔄 active — T1–T6 ✅ T8 ✅ (coverage gate); **369 tests in 27 files**. T7 QA pass pending (live review) |
| S17 — Component Unification | ✅ **complete** (v1.3.0) |
| S18 — Product Analytics & Feedback | ✅ **complete** (v1.5.5, T11 deferred to S3) |
| **S19 — Mobile Excellence & Account** | ✅ **complete** (v1.9.1) |
| **S20 — Auth Excellence** | ✅ **complete** — 34 E2E tests (v1.9.1) |
| **S21 — Backend Architecture** | ✅ **complete** — user_store JSONB sync, offline queue, real-time, skeletons (v2.2.1) |
| **S22 — UX Action Prominence** | ✅ **complete** — UiFab + 8 modules + Dashboard onboarding (v2.0.0) |
| **S23 — Tetris Improvements** | ✅ **complete** — hold piece (C key / swipe-up), line-clear flash, score history top-5 (v2.2.0) |
| **S25 — Demo Mode Seeding** | ✅ **complete** — realistic data seeded on demo login: tasks, goals, habits, notes, finance, board (v2.2.0) |
| **S26 — Mobile QA & Fixes** | ✅ **complete** — keyboard/layout fixes, scroll reset, FAB clearance, modal bottom-sheet, Android back button, touch targets, 100dvh migration, S9 color fixes (v2.2.4) |

**Active sprints (2026-06-04):**
- **S21 — Backend Architecture** 🔜: Supabase-first data, skeletons, real-time (blocked on Supabase credentials)
- **S11 T2** 🔜: Welcome page redesign + cascade demo (requires user review session)
- **S16 T7** 🔜: QA pass (requires live review)
- **S13 — Design Pass** 🔜: requires live review session

**New in v2.2.4 (2026-06-04) — S26 Mobile QA & Fixes:**
- Studio `/ai` route: `meta: { fullbleed: true }` — iOS keyboard no longer collapses the chat input
- AppBottomTabs: Android back button now closes the More drawer (pushState + popstate listener)
- UiModal: fixed mobile bottom-sheet — `align-items: flex-end`, `padding-bottom` clears tab bar (was targeting `.ui-modal__container` typo)
- Board: mobile column tabs now meet 44px touch target minimum (`min-height: 44px`)
- Learning/Training form: code-audited — `flex-wrap: wrap` already correct, Add Plan + Cancel visible on all screen sizes

**New in v2.0.0 (2026-06-03) — S22 UX Action Prominence:**
- `UiFab` component in `@/ui` — 56px FAB, mobile-only (≤767px), fixed bottom-right above tab bar, showcase at `/docs/ui-kit/fab`
- Tasks: primary "**+ New task**" button in header + FAB
- Goals: FAB with Target icon
- Habits: FAB with CheckSquare icon
- Notes: FAB visible only on list screen (hidden when editor is open on mobile)
- Learning: FAB with BookOpen icon
- Training: FAB with Dumbbell icon
- Finance: FAB with CreditCard icon
- Board: primary "**+ New card**" button in header + FAB with Layout icon
- Dashboard: onboarding checklist card — shows unchecked items with navigation, disappears when all 4 modules have data

**New in v1.5.6–v1.5.15 (2026-06-03) — backlog + Phase 2 responsive batch:**
- Studio: export conversation as markdown (Download button, v1.5.6)
- Habits: push notifications at 21:00 for streak-at-risk — `useHabitNotifications`, toggle in Settings → Privacy & Data (v1.5.7)
- Notes: hide type/goal selectors on mobile, overflow-scroll toolbar (v1.5.8)
- Docs: mobile nav dropdown — select replaces left sidebar on sm (v1.5.9)
- Dashboard: tablet module sidebar collapses at 900px, compact habit-spotlight on mobile (v1.5.10)
- Board: scrollable filter bar on mobile, 1-col modal form (v1.5.11)
- Habits: `HabitEmojiPicker` component replaces text input — 7 categories, search, 100+ emojis (v1.5.12)
- Finance: compact stacked header + scrollable tabs on mobile (v1.5.13)
- Calendar: compact cells, natural detail panel height on mobile (v1.5.14)
- Learning + Training: AI form stacks vertically on mobile, today list scroll (v1.5.15)

**Previous v1.5.x (2026-06-03):**
- S16 T3: achievements + notifications + widgets store tests added (v1.5.2)
- S16 T6: Playwright E2E smoke tests added (v1.5.3)
- S15 T7: qa-report.md refreshed to v1.5.2 reality (v1.5.2)
- S11 T1: WelcomeView copy + hex cleanup (v1.5.1)
- Backlog: habit-of-the-day spotlight on Dashboard (v1.5.4)
- Backlog: HabitCard mobile tap target 48px (v1.5.4)

> **AI provider note (v1.0.12):** Pollinations left only `openai-fast` (GPT-OSS 20B) on the anonymous tier. Default model is pinned to `openai-fast` in `src/core/composables/provider.ts` and Studio's free-model list trimmed to it.

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
- **Patch** (`0.x.Y+1`): small fix, visual tweak, copy change
- **Minor** (`0.X+1.0`): new module or significant feature
- **Major** (`X.0.0`): reserved for production launch with full auth

Update `package.json` `"version"` in the same commit.

---

## S9 Visual rules (all new/touched UI must follow these)

- **No hardcoded hex colors.** Use `--color-warning` not `#f59e0b`, etc.
- **No `rgba()` for alpha.** Use `color-mix(in srgb, var(--color-accent) 12%, transparent)`.
- **Hover states via color-mix.** Not flat `--color-surface-elevated` — add an accent tint.
- **Shadows via tokens.** `--shadow-1` base, `--shadow-2` hover, `--shadow-3` panels, `--shadow-4` modals.
- **Line-heights via tokens.** `--leading-xs` → `--leading-3xl` — never bare `1.5`.
- **`UiCard` for all card containers.** `surface="raised"` for interactive/content cards.

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

Every new component must work at `lg` and `sm` at minimum. Content max-width: `var(--content-max-width)` (1040px desktop, 1200px on xl screens).

---

## General coding conventions

- Module structure: `types → store → composable → components → view`
- No new dependencies without written reason in module doc
- Every new module needs `docs/modules/[name].md` spec before implementation
- localStorage keys: `platform:[module-id]:[entity]`
- Full details: `docs/conventions.md`

## Tech stack

- Vue 3 + TypeScript + Vite 6
- Pinia for state, Vue Router for routing
- `marked` for markdown rendering
- No CSS frameworks — scoped component CSS + global tokens in `src/assets/styles/main.css`
- `@/ui` for all shared components — import from `src/ui/index.ts`
