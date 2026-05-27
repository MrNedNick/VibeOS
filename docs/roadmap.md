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

### 2026-05-27 (session 3 — fast wins)
- **README.md** — complete portfolio README: modules table, tech stack, architecture decisions, keyboard shortcuts, sprint plan, run instructions
- **Event bus hardening** — correct `card:created` / `card:moved` event types (kanban was wrongly firing `snippet:created`); new `studio:run` event type replaces `game:score` hack; `snippet:created` now wired in snippets store; Recent Activity panel handles all new types with distinct icons + colors
- **Settings → Data section** — export all localStorage as dated JSON backup; clear-all with 5s confirm-or-cancel dialog; both actions fully functional
- **Settings → Keyboard shortcuts** — full cheatsheet table with `<kbd>` pill styling covering all 15 global shortcuts across all modules
- **Settings + About → `available`** — both modules promoted from `wip` to `available` in registry
- **Tasks due dates** — `dueDate?: string` on Task type; `setDueDate()` action; overdue (red) / today (amber) / upcoming (muted) badge on each task item; propagated through TaskList → TaskManagerView
- **About page v2** — shipped modules list (7 modules with icons + descriptions), quick stats row (modules count, TS errors, zero extra deps, bundle size), live site link
- **Board swimlanes + task unification** — S4 differentiator: Timeline view with date-based swimlane rows (overdue / today / tomorrow / this-week / later / no-date) × status columns; 2D drag-and-drop sets both column and due date; Kanban ↔ Timeline toggle (persisted); task import panel (slide-in, links card to source task, auto-completes task on Done); due date badge with urgency styling; inline date picker in expanded card
- **i18n system** — custom Pinia store (zero new deps), EN + RU locales, 90+ translated keys, `pluralRu()` helper for Russian declension
- **Settings module** at `/settings` — Appearance tab: theme + language toggles working; stub sections for Keyboard / Data / Account
- **About page** at `/about` — VibeOS logo SVG, 7-item tech stack grid, version row, GitHub link, responsive
- **Habits improvements** — inline name editing, confirm-before-delete with 4s auto-cancel, Russian plural streaks
- **Games lobby redesign** — inline SVG game previews, best-score display, per-game color accents
- **Memory Cards** — CSS 3D flip, easy/medium/hard difficulty, best time persistence
- **Snake** — canvas game loop, WASD + arrows, difficulty levels, best score
- **Page transition fix** — opacity-only (no translateY), `@after-leave` hook prevents layout shift between fullbleed and padded views
- **Command Palette** — `wip`-status modules navigable, all strings translated
- **Sidebar** — `wip` modules show amber badge and are navigable
- **Event bus** — typed `PlatformEvent` union, Pinia store with `emit()` + persisted `history[]`, wired into tasks/habits/notes stores
- **Dashboard Recent Activity** — live feed of last 12 events next to the All Tasks overview
- **Notes "Today" button** — opens or creates a daily journal note (`# YYYY-MM-DD`), always idempotent
- **localStorage schema versioning** — `useStorage(key, default, { version, migrate })` with automatic migration on version mismatch
- **Kanban Board** at `/kanban` — 3 columns (Backlog/In Progress/Done), native HTML5 drag-and-drop, inline card creation, title + description editing, 5-level priority with color strip, responsive
- **Studio module** at `/ai` — Prompt Lab v1: model selector (Opus/Sonnet/Haiku), API key stored locally, system prompt, response meta (tokens + duration), copy, run history (last 20, searchable), ⌘↵ shortcut

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

~~**Localization** — shipped 2026-05-27 as custom Pinia store (EN + RU, 90+ keys, pluralRu helper, no new dep)~~

### Currency
Demoted from standalone module to a Dashboard widget. Standalone converter could come back later.

### Backend-connected module ideas (researched 2026-05-27)

Prioritized by portfolio value and safety (free tier / no surprise bills).

#### Tier 1 — Recommended (100% free, high portfolio value)

| Module | API / Backend | Free tier | Why |
|--------|--------------|-----------|-----|
| **Weather widget** | OpenWeatherMap | 1,000 calls/day free forever | Classic portfolio widget. Show current weather + 3-day forecast on Dashboard. API key stored locally in Settings. |
| **Analytics dashboard** | Plausible or built-in | Self-host or build custom | Track VibeOS usage internally via event bus — heatmap of daily usage, module popularity, session duration. No external API needed. |
| **Bookmarks / Read later** | Built-in (localStorage → Supabase) | Free | Paste URL → fetch OG metadata → save with tags. Demonstrates data modeling. |
| **GitHub activity** | GitHub REST API | 5,000 req/hour unauthenticated | Show recent commits, PRs, contribution graph. No key needed for public repos. |

#### Tier 2 — Good (free tier with limits, watch usage)

| Module | API / Backend | Free tier | Why |
|--------|--------------|-----------|-----|
| **Maps / Location** | Leaflet + OpenStreetMap | Completely free (no API key) | Interactive map widget. No tiles fee — OSM is open. Leaflet is 42kb. |
| **World clock** | Built-in (Intl API) | Free, no API | Show multiple timezones. Uses browser's `Intl.DateTimeFormat`. Zero API cost. |
| **Dev jokes / Quotes** | JokeAPI / ZenQuotes | Free, no key | Tiny motivational widget. ~1 call/session. |
| **Pomodoro with sync** | Supabase (S3) | 500MB free tier | Timer + session log synced to Supabase. Demonstrates real-time backend. |

#### Tier 3 — Future / requires caution

| Module | API / Backend | Cost concern | Notes |
|--------|--------------|-------------|-------|
| **AI Studio (current)** | Anthropic API | Pay-per-use | Already built. Haiku is cheapest (~$0.001/req). Key required, cost warning shown. |
| **Spotify Now Playing** | Spotify Web API | Free but OAuth required | Personal touch widget. Needs Spotify account + OAuth flow (S3 dep). |
| **Currency rates** | ExchangeRate-API | 1,500 req/month free | Dashboard widget, not standalone module. Low priority. |

#### Recommended database options

| Option | Free tier | Best for |
|--------|-----------|----------|
| **Supabase** (already chosen for S3) | 500MB, 50K rows, 2 projects | Auth + Postgres + Realtime. Best portfolio value. |
| **Turso (libSQL)** | 9GB storage, 500M reads/month | Edge-native SQLite. If Supabase feels heavy. |
| **PlanetScale** | Discontinued free tier | ~~Not recommended~~ |
| **Neon (Postgres)** | 512MB, 1 project | Serverless Postgres. Good alternative to Supabase. |
| **localStorage** (current) | Unlimited | Offline-first. Current approach. Works for portfolio demo. |

#### Safety rules for backend modules
- Every external API must have a free tier or be completely free
- API keys stored only in browser localStorage, never in code
- Cost warnings shown in UI before any paid API call
- Default to lowest-cost model/tier
- No auto-refresh patterns that burn API quota
- All modules must work offline with graceful degradation

### Other open APIs (low-priority widgets)
GitHub stats, Hacker News feed, crypto prices, NASA APOD, dev jokes, world time.

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
| 2026-05-27 | `card:created` / `card:moved` / `studio:run` event types added | Correct semantics; kanban was emitting `snippet:created` for cards which polluted the activity feed |
| 2026-05-27 | Tasks `dueDate` field as `string` (`YYYY-MM-DD`), no Date object | Consistent with Board cards; string compare works for overdue/today classification without a date library |
| 2026-05-27 | i18n without vue-i18n — custom Pinia store | Zero new dependencies; `t(key, vars?)` + `pluralRu()` cover all needs; reactive via computed `messages` |
| 2026-05-27 | Snippets retained as standalone module | Unique developer daily value (syntax highlighting, language filter, tag search) vs Notes text; not redundant |
| 2026-05-26 | Sidebar sections: System / Apps | Cleaner than Platform/Modules; matches VibeOS OS metaphor |
| 2026-05-27 | Dashboard icon fix: UiIcon replaces raw text in 3 components | ModuleDetailPanel, AllTasksPanel, ModuleStatusCard all had `{{ mod.icon }}` instead of `<UiIcon>` |
| 2026-05-27 | Full Russian translation for dashboard UI | 80+ i18n keys added for module descriptions, milestones, section labels, activity events |
| 2026-05-27 | Kanban add-card uses modal overlay instead of inline textarea | Modal with title, description, column, priority, due date — consistent with platform UI |
| 2026-05-27 | Studio model IDs updated to Claude 4.6 (Opus, Sonnet) + Haiku 4.5 | Stay current with latest model versions |
| 2026-05-27 | Studio shows clear API key requirement + cost warning when no key set | User must understand costs before using any paid API |
| 2026-05-27 | Backend module research: Weather (OpenWeatherMap), Maps (Leaflet+OSM), Analytics (built-in) as top picks | All free, high portfolio value, no surprise bills |

---

## Open decisions

| Item | Status | Notes |
|------|--------|-------|
| Snippets module | Keep for now, decide later | User unclear on value. Module is 100% complete. Will revisit after more usage. |
| Habits improvements | Planned but not urgent | Current state is good. Keep as-is except already-planned event bus achievements. |
| Games additions | Low priority | Current three games are solid. Tetris or Minesweeper next if time allows. |
| Settings future features | Roadmap items | Account, shortcuts, theme packs, notifications, data export/import, privacy prefs — all planned for S3+ |
| Documentation translation | In progress | Russian translation support added for dashboard. Docs content itself is English-only; Russian doc summaries planned. |
| Weather widget | Approved for implementation | OpenWeatherMap free tier, 1000 calls/day. Will add to Dashboard as widget. |
