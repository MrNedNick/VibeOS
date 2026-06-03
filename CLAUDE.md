# VibeOS — Project Instructions for Claude

> ⚠️ **DOCS RULE (non-negotiable):** After every sprint, feature group, or significant change — update `CLAUDE.md`, `docs/roadmap.md`, and relevant module docs in the **same commit**. Stale docs silently break future AI sessions. If you ship code without updating docs, the next session starts with wrong context.

---

## Current state

**Version: v1.5.0 — 2026-06-03**

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
| S11 — Welcome & Positioning | 🔜 **next** — "simpler Notion for life, everything connected" + live cascade demo. Copy locked (2026-06-01). |
| S12 — AI Depth | ✅ complete — Analytics report ✅ (v1.0.11), Habits insights + Notes summarise + Finance analysis ✅ (v1.1.0) |
| S13 — Design Pass | 🔜 planned — module quality pass (requires user review session) |
| S14 — Quick Wins | 🔄 active — T1 ✅ T2 ✅ T3 ✅ T5 ✅ T6 ✅; T4 hex cleanup: CalendarView ✅, WelcomeView folds into S11 |
| S15 — Refactor & De-dup | ✅ **complete** — T1–T4 ✅ T6–T9 ✅ (v1.4.0). T5 Learning/Training deferred (diverged enough post-S17). |
| S16 — Test Coverage | 🔄 active — T1–T5 ✅ T8 ✅ (coverage gate); remaining: T6 E2E, T7 QA. **330 tests in 24 files** |
| S17 — Component Unification | ✅ **complete** — Phase 0 (v1.2.1): UiModal/UiIconButton/UiSelect/UiTextarea; Phase 1 T6–T13 (v1.2.2–v1.2.6): all modules migrated; Phase 2 T14 (v1.2.10): ESLint enforcement; T15 sprint close (v1.3.0). |
| S18 — Product Analytics & Feedback | 🔄 active — T1–T10 ✅ (v1.4.1–v1.4.7) T12 🔄 (docs, tests, showcase): UiFeedbackModal in docs-registry, feedback.store + interaction.store tests, conventions updated. Remaining: T11 Supabase schema, T12 final close. |

**Active next (2026-06-03): S11 (welcome + positioning) is the main user-facing sprint. S15 ✅ complete. S17 ✅ complete. S18 T12 🔄 in progress (docs+tests done; T11 Supabase blocked on credentials). S16 T8 ✅ coverage gate active (330 tests in 24 files, thresholds: stmt 35%, branch 22%). S14 T4 ✅ hex guard added. S13 requires live review.**

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
