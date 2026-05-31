# VibeOS — Project Instructions for Claude

## Strategy & sprint plan

Before starting any non-trivial work, read:
- `docs/strategy.md` — positioning, architecture decisions, per-module direction
- `docs/roadmap.md` — current sprint plan (S1–S9; S8 is the active sprint)

**Current state (v0.9.3, 2026-05-31):** S1–S8 complete. S9 active — Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ (all 7 modules done).

**Active sprint — S8: Design System**
Priority order within S8:
1. `UiSkeleton.vue` + skeleton loaders for all Dashboard widgets (fixes WeatherWidget layout shift)
2. Configurable Dashboard widgets (reorder, show/hide, uniform card height)
3. Unified component architecture audit + extract patterns to `@/ui`
4. `/ui-kit` component library page (multi-session; use Claude in Chrome + `docs/design-system-reference.md`)
5. Design token extension in `main.css`

**Sprint shorthand (completed):**
- **S1 — Identity:** positioning, logo, vibe-paks, Lucide icons, copy pass, landing ✅
- **S2 — Command Center:** Command Palette ⌘K, Settings module, Dashboard panels, About ✅
- **S3 — Backend:** Supabase auth code complete; paused awaiting credentials ⏸
- **S4 — Core Life Modules:** Goals, Tasks life categories, Habits depth, Notes backlinks ✅
- **S5 — Life Depth:** Learning, Training, Analytics, Calendar, Weather widget ✅
- **S6 — AI Integration:** 9 AI features shipped, Pollinations.ai free tier ✅
- **S7 — Polish:** Error boundaries done; Vitest + CI pending 🔜
- **S8 — Design System:** skeleton loaders, widget customization, `/ui-kit`, unified @/ui 🔜 ACTIVE
- **S9 — Full Redesign:** Revolut-style visual overhaul (after S8) 🔜

---

## Auto-commit and deploy rule

After every successful implementation of a task or group of related tasks:
1. Run `npm run type-check` to verify no TypeScript errors
2. Stage the relevant files
3. Bump `package.json` version (see Version bump rule below)
4. Create a commit with a clear message describing what was implemented
5. **Push to `main`** — this triggers the GitHub Actions deploy to `mrnednick.github.io/VibeOS`
6. **Do this automatically** — do not ask for confirmation unless the change is destructive

```
feat: short description of what was added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Use `feat:` for new features, `fix:` for bug fixes, `style:` for visual/font changes, `docs:` for documentation updates, `refactor:` for refactoring.

**Push command:** `git push origin main`

The deploy is considered live when GitHub Actions finishes (≈ 2 minutes after push). The version number visible in the About page and Dashboard header confirms the correct deploy is live.

---

## Responsive design

### Target breakpoints

| Breakpoint | Target device | Width |
|------------|--------------|-------|
| `xl` | Mac Studio Display (27" 5K) | ≥ 1920px |
| `lg` | MacBook Pro 14"/16" (default) | 1280px – 1919px |
| `md` | iPad / small laptop | 768px – 1279px |
| `sm` | Mobile (iPhone) | < 768px |

The owner uses MacBook and Mac Studio Display as primary devices. Mobile is secondary but required.

### Responsive roadmap

**Phase 1 — Foundation (do before shipping any module):**
- Define CSS breakpoint variables in `main.css`
- Sidebar: collapses to icon-only (`--sidebar-collapsed`) on `md`, becomes a bottom tab bar on `sm`
- AppLayout: switch from side-by-side to stacked layout on `sm`
- Content padding scales: `32px` on `lg+`, `20px` on `md`, `14px` on `sm`

**Phase 2 — Per-module (when each module is built or polished):**
- Dashboard: stat cards go 2×2 grid on `md`, 1 column on `sm`
- Tasks: full-width on all sizes, already flexible
- Notes: hide preview pane on `sm` (edit-only mode), collapse note list behind a toggle button on `sm`
- Docs: sidebar becomes a top dropdown on `sm`

**Phase 3 — Mac Studio Display optimization:**
- Max content width increases from `1000px` to `1200px` for `xl` screens
- Font sizes already bumped; no further scaling needed unless specified

### Rule: always develop with responsive in mind

**Every new component and every new module must include responsive styles from day one.**

Checklist before considering any UI feature done:
- [ ] Works on MacBook (1280–1440px wide)
- [ ] Works on Mac Studio Display (≥ 1920px) — content doesn't over-stretch
- [ ] Works on mobile (< 768px) — nothing overflows, text is readable, tap targets ≥ 44px
- [ ] Tested at each breakpoint in browser DevTools before marking complete

Do not ship UI without checking at least `lg` and `sm` breakpoints.

---

## Version bump rule

Every time a new feature is built **and deployed**, bump the version in `package.json`:

- **Patch** (`0.x.Y` → `0.x.Y+1`): small fix, visual tweak, copy change
- **Minor** (`0.X.0` → `0.X+1.0`): new module shipped, significant feature added
- **Major** (`X.0.0`): reserved for production launch / full auth + backend live

Update `package.json` `"version"` field as part of the same commit that ships the feature.
This makes it immediately visible in the browser (About page, footer, or console) whether the latest deploy is live.

---

## General coding conventions

- Module structure: `types → store → composable → components → view`
- No new dependencies without a written reason in the module doc
- Every new module needs a spec in `docs/modules/[name].md` before implementation
- Update `docs/roadmap.md` when features are shipped or planned items change
- localStorage keys follow `platform:[module-id]:[entity]` pattern

## Tech stack

- Vue 3 + TypeScript + Vite 6
- Pinia for state, Vue Router for routing
- `marked` for markdown rendering
- No CSS frameworks — all styles are scoped component CSS + global tokens in `main.css`
