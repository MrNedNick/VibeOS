# VibeOS — Project Instructions for Claude

> ⚠️ **DOCS RULE (non-negotiable):** After every sprint, feature group, or significant change — update `CLAUDE.md`, `docs/roadmap.md`, and relevant module docs in the **same commit**. Stale docs silently break future AI sessions. If you ship code without updating docs, the next session starts with wrong context.

---

## Current state

**Version: v1.0.12 — 2026-06-01**

| Sprint | Status |
|--------|--------|
| S1 — Identity | ✅ complete |
| S2 — Command Center | ✅ complete |
| S3 — Backend/Auth | ⏸ paused — code done, awaiting Supabase credentials from user |
| S4 — Core Life Modules | ✅ complete |
| S5 — Life Depth | ✅ complete |
| S6 — AI Integration | ✅ complete |
| S7 — Polish | ✅ complete — Vitest ✅ (59 tests), CI ✅, Lighthouse 82 ✅, a11y 100 ✅, bundle badge ✅ |
| S8 — Design System | ✅ complete — @/ui ✅, tokens ✅, skeletons ✅, widgets ✅, /ui-kit page ✅ (v1.0.12) |
| S9 — Full Redesign | ✅ complete — Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅ |
| S10 — Vibe-pak Consolidation | ✅ complete — T1 ✅ T2 ✅ T3 ✅ T4 ✅ T5 ✅ |
| S11 — Welcome & Positioning | 🔜 next — "simpler Notion for life, everything connected" + live cascade demo (repositioned 2026-06-01) |
| S12 — AI Depth | 🔄 active — Analytics monthly report ✅ (v1.0.11); Habits/Notes/Finance pending |
| S13 — Design Pass | 🔜 planned — module quality pass (requires user review session) |
| S14 — Quick Wins | 🔄 active — T1 lazy routes ✅ (v1.0.8), T5 AI provider seam ✅ (v1.0.9), T3 soft-delete ✅ (v1.0.10); README refresh, hex cleanup pending |

**Active next (re-ordered 2026-06-01): S11 (positioning + welcome) → S12 AI Depth (Habits/Notes/Finance remain — Analytics report ✅). Done as fill-in: S8 item 4 /ui-kit ✅, S14 T1/T3/T5 ✅. Remaining S14: T2 README refresh, T4 hex cleanup.**

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
