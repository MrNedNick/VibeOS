# VibeOS — Project Instructions for Claude

## Strategy & sprint plan

Before starting any non-trivial work, read:
- `docs/strategy.md` — positioning, architecture decisions, per-module direction
- `docs/roadmap.md` — current sprint plan (S1 → S5)

Active sprint and priority are encoded in each task subject as `[S1·P0]`, `[S2·P1]`, etc. Pick tasks in sprint order (S1 → S2 → S3 → S4 → S5) and within a sprint follow the `metadata.order` field. Don't pull from a later sprint while earlier-sprint tasks are still open unless explicitly redirected.

**Sprint shorthand:**
- **S1 — Identity:** positioning, logo, vibe-paks, Lucide icons, copy pass, landing, README
- **S2 — Wow:** Command Palette ⌘K, Settings module, event bus, Dashboard redesign, About
- **S3 — Backend:** schema migrations, Supabase auth/sync, error boundaries + 404
- **S4 — Module depth:** Tasks (Today/Focus/Streaks), Notes (backlinks/journal), Board, Studio, Snippets, Habits
- **S5 — Polish:** Vitest + CI gate

---

## Auto-commit rule

After every successful implementation of a task or group of related tasks:
1. Run `npm run type-check` to verify no TypeScript errors
2. Stage the relevant files
3. Create a commit with a clear message describing what was implemented
4. **Do this automatically** — do not ask for confirmation unless the change is destructive

Commit message format:
```
feat: short description of what was added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Use `feat:` for new features, `fix:` for bug fixes, `style:` for visual/font changes, `docs:` for documentation updates, `refactor:` for refactoring.

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
