# Roadmap

> Re-planned 2026-05-27 around a 5-sprint structure. See `docs/strategy.md` for the strategic context behind this plan.

This document tracks what we're building, what's next, and the ideas backlog.

---

## Active sprint plan

The work is organized into five sprints, each with a focused goal. Tasks live in the project task list — see `[S1]` / `[S2]` / `[S3]` / `[S4]` / `[S5]` prefixes in subjects.

| Sprint | Goal | Why now |
|--------|------|---------|
| **S1 — Identity** | Make first impression land in 10s | Currently nothing hooks a cold visitor |
| **S2 — Wow-features** | Make it feel like a real OS | Command palette + Settings + live dashboard |
| **S3 — Backend** | Lift from "demo" to "real product" | Supabase sync + schema migrations + error boundaries |
| **S4 — Module depth** | Differentiate modules from competitors | Today/Focus/Streaks, backlinks, time-swimlanes, prompt lab |
| **S5 — Polish** | Close credibility gaps | Tests + CI |

---

## S1 — Identity (active)

**Goal:** a cold visitor lands on the URL and is hooked within 10 seconds.

Order:
1. **Positioning, tagline, brand voice** — foundation; everything else inherits from this
2. **Logo mark + accent color** — replace the `//` placeholder with a real mark (recommended: blinking block cursor ▮)
3. **Vibe-paks v1** — ship 2 packs (Terminal Dark + Brutalist); main visual hook
4. **Lucide icon system** — replace unicode glyphs; vibe-paks need consistent iconography to land
5. **Copy personality pass** — empty states, tooltips, loading skeletons, 404 voice
6. **Landing page at `/welcome`** — separate marketing from OS shell
7. **README with demo GIF** — record after vibe-paks ship so the GIF showcases them

---

## S2 — Wow-features

**Goal:** the OS metaphor becomes real, not a name.

Order:
1. **Command Palette ⌘K** — highest single-feature ROI; modules register commands centrally
2. **Settings module** — Appearance / Account / Keys / Data / Shortcuts / About tabs; unblocks Studio and migrates the temporary vibe-pak picker
3. **Event bus + Recent Activity feed** — typed cross-module events; powers dashboard widget and future analytics
4. **Dashboard widget redesign** — clock, weather, Today tasks, last 5 events, activity heatmap; dev metrics move to a "Platform" tab
5. **About / Profile page** — `/about` route with bio + links; portfolio anchor that's currently missing

---

## S3 — Backend & reliability

**Goal:** real product feel — data survives, errors don't break the app.

Order:
1. **Schema versioning + migration runner** — extend `useStorage(key, default, { version, migrations })`; must precede Supabase
2. **Supabase integration** — GitHub OAuth + Postgres + Realtime; offline-first, sync on login
3. **Error boundaries + real 404 page** — fallback UI on uncaught errors; errors logged to event bus

---

## S4 — Module depth

**Goal:** each module has at least one differentiator from competitors.

| Module | Differentiator |
|--------|----------------|
| Tasks (Stride) | Today view + Focus mode (Pomodoro) + Streaks heatmap + natural-language input |
| Notes (Inkwell / Slate) | `[[wiki backlinks]]` + daily journal button |
| Board | Time-based swimlanes (rows = days, cols = statuses), cards unified with Tasks |
| Studio | Prompt Lab — run one prompt across Opus/Sonnet/Haiku in parallel |
| Snippets | New module: code vault with highlight.js + tags + search |
| Habits | New module: daily check-offs + heatmap; ships last |

---

## S5 — Polish & testing

- **Vitest + Vue Test Utils** + first wave of unit/component tests
- CI gate: type-check + tests must pass on PRs
- "tests passing" badge in README

---

## Recently shipped (history)

### 2026-05-27
- Game lobby at `/games` with cards for each game
- 2048 — CSS grid, merge logic, best score persistence, arrow keys + WASD + swipe
- Win / game-over overlays with continue / restart

### 2026-05-26
- Module quick-launch `→` button in Dashboard hover
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

Vercel preview deploys per PR are a recommended future step — see S5 polish.

---

## Backlog (not yet scheduled)

### Tabs / window manager
Open modules as tabs in the shell (`<KeepAlive>`) so state survives navigation. Optional "stage view" with draggable windows for screenshots. Big visual win but high effort — defer past S5.

### Additional vibe-paks
After v1 ships with 2 packs, add Soft Glass (backdrop-filter blur) and CRT Retro (green phosphor + scanlines).

### Per-app accent color
Allow each module to override the platform accent color in Settings → Appearance.

### Achievements system
Use event bus to track milestones ("Created 100 tasks", "Played all games"). Game-like layer.

### Localization (vue-i18n)
EN + RU. Task Manager is the reference implementation. Deferred until S4 module depth settles — don't externalize strings that are still in flux.

### Currency
Demoted from standalone module to a Dashboard widget. Standalone converter could come back later.

### Other open APIs (low-priority widgets)
GitHub stats, Hacker News feed, weather, crypto prices, NASA APOD, dev jokes, world time.

### Read later / Bookmarks
Mini-Pocket: paste URL → fetch metadata (oembed / OG tags) → save with tags. Fits "personal OS" angle.

### Now playing
Spotify integration — what's playing right now. Personal touch widget.

### Games backlog
After Memory and Snake: Tetris or Minesweeper (more visual/recognizable than Wordle).

---

## App planning discipline

> **Rule:** No app is implemented without a written specification first.

1. Write the spec — `docs/modules/[name].md` with purpose, data model, component architecture, open questions
2. Define the data model — TypeScript interfaces for the main entities
3. Choose dependencies — libraries, patterns, architectural decisions
4. Add to dashboard — update `MODULE_DETAILS` in `platform-notes.ts` with nextTasks and notes
5. Only then implement — following the established module pattern

---

## Responsive design rule

Every new component and module must include responsive styles from day one. See `CLAUDE.md` for the full checklist.

| Breakpoint | Device | Width | Priority |
|------------|--------|-------|----------|
| `xl` | Mac Studio Display (27" 5K) | ≥ 1920px | Primary |
| `lg` | MacBook Pro 14"/16" | 1280–1919px | Primary |
| `md` | iPad / small laptop | 768–1279px | Secondary |
| `sm` | Mobile | < 768px | Required |

---

## Decisions log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-27 | 5-sprint plan: Identity → Wow → Backend → Module depth → Polish | Re-planned after deep audit; see docs/strategy.md |
| 2026-05-27 | Supabase chosen as optional backend (not custom Node, not Pocketbase) | Free tier, GitHub OAuth, Realtime — portfolio value in days |
| 2026-05-27 | Vibe-paks v1 ships with 2 packs (Terminal Dark + Brutalist) | Two distinct moods is enough to demonstrate the system; add Glass + CRT later |
| 2026-05-27 | Lucide icons replace unicode glyphs | One small dep, system-wide visual coherence |
| 2026-05-27 | Currency demoted from module to Dashboard widget | Standalone converter has low daily-use value vs widget |
| 2026-05-26 | `marked` for markdown rendering | Simple API, no Vue wrapper needed |
| 2026-05-26 | Static data files for dashboard notes | Keeps content close to code, easy to migrate to API later |
| 2026-05-26 | Module `section` field in registry | Enables multi-section sidebar without breaking existing modules |
| 2026-05-26 | Dashboard at `/` (not `/dashboard`) | Home page should be the platform overview |
| 2026-05-26 | Notes: textarea + marked, no editor lib | Zero bundle cost, full control |
| 2026-05-26 | Platform rebranded to VibeOS | Developer culture identity; Geist font |
| 2026-05-26 | Sidebar sections: System / Apps | Cleaner than Platform/Modules; matches VibeOS OS metaphor |
