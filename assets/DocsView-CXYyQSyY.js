import{c as w,E as R,i as I,f as a,b as s,L as M,I as L,F as A,v as C,e as S,u as P,t as r,A as f,p as D,B as m,G as x,_ as N,J as E,h as U,g as V,o as F}from"./index-5kl17AL7.js";import{g as _}from"./marked.esm-Ch4bKn2a.js";import{D as O,f as B}from"./docs-registry-C1Fz0MoL.js";const G="# Architecture\n\n## Overview\n\n**frontend-platform** is a Vue 3 platform application built as a single codebase containing multiple independent modules. Each module is a self-contained feature area (Task Manager, Kanban, Notes, etc.) sharing a common infrastructure.\n\n---\n\n## Folder Structure\n\n```\nsrc/\n├── assets/styles/       # Global CSS tokens and reset\n├── core/                # Platform-level shared infrastructure\n│   ├── composables/     # useStorage, useAsync — shared across all modules\n│   ├── registry/        # PLATFORM_MODULES — navigation manifest\n│   ├── stores/          # ui.store (theme, sidebar), notifications.store\n│   ├── types/           # Shared TypeScript types (ID, LoadingState…)\n│   └── utils/           # id.ts, storage.ts — pure utilities\n├── layouts/             # AppLayout + AppSidebar, AppHeader, AppNotifications\n├── modules/             # Feature modules (one folder per module)\n│   └── task-manager/\n│       ├── index.ts     # Route definitions + module constants\n│       ├── types/       # Module-specific TypeScript interfaces\n│       ├── stores/      # Pinia store(s) for this module\n│       ├── composables/ # Business logic composables\n│       ├── components/  # Presentational components\n│       └── views/       # Route-level components (one per route)\n├── router/              # Vue Router configuration\n└── ui/                  # Shared reusable UI components (Ui* prefix)\n```\n\n---\n\n## Key Layers\n\n### `core/` — Platform Infrastructure\nEverything in `core/` is available to any module. It should never import from `modules/`.\n\n- **`useStorage(key, default)`** — reactive localStorage ref, auto-persists via watcher\n- **`useAsync(fn)`** — wraps async calls with `loading`, `error`, `data` state\n- **`ui.store`** — theme (dark/light), sidebar open/collapsed; persisted to localStorage\n- **`notifications.store`** — toast system; `success/error/warning/info` convenience methods\n- **`PLATFORM_MODULES`** — central registry for sidebar navigation\n\n### `modules/[name]/` — Feature Modules\nEach module is isolated. Only dependencies allowed: `@/core/*` and `@/ui/*`.\n\nModule `index.ts` exports:\n- `MODULE_ID`, `MODULE_PATH`, `MODULE_LABEL` — used by registry\n- `[name]Routes` — RouteRecordRaw[] imported by `router/index.ts`\n\n### `ui/` — Shared UI Components\nPresentational-only components with `Ui` prefix. No business logic, no store access.\n\nCurrent components: `UiButton`, `UiBadge`, `UiInput`\n\n### `layouts/` — Application Shell\n`AppLayout.vue` composes the full shell: sidebar + header + `<router-view>` + notifications.\nAll modules render inside this layout via the router's `children` array.\n\n---\n\n## Data Flow\n\n```\nView → composable (useTasks) → Pinia store → useStorage → localStorage\n                              ↑\n         core store (notifications) — cross-cutting side effects\n```\n\nViews are thin. Business logic lives in composables. State lives in stores.\n\n---\n\n## Adding a New Module\n\n1. Create `src/modules/[name]/` with the standard folder structure\n2. Define types in `types/index.ts`\n3. Create Pinia store using `storageKey('[name]', 'key')` for namespaced persistence\n4. Implement composables that wrap store + notifications\n5. Build components; use `@/ui` for shared primitives\n6. Create a view that composes components via the composable\n7. Export routes from `index.ts` and register in `src/router/index.ts`\n8. Set `available: true` in `src/core/registry/modules.ts`\n\n---\n\n## Storage Namespacing\n\nAll localStorage keys follow the pattern: `platform:[module]:[key]`\n\nExamples:\n- `platform:task-manager:tasks`\n- `platform:ui:theme`\n- `platform:ui:sidebar`\n\n---\n\n## Routing Conventions\n\n- Route names: `[module-id].[action]` — e.g. `task-manager.list`, `task-manager.detail`\n- All routes are children of the root `AppLayout` route\n- Route meta carries `module` (id) and `title`\n- Module views are lazy-loaded via dynamic imports\n",H="# Conventions\n\n## Naming\n\n| What | Convention | Example |\n|------|-----------|---------|\n| Vue components | PascalCase | `TaskItem.vue`, `UiButton.vue` |\n| Shared UI components | `Ui` prefix | `UiButton`, `UiBadge`, `UiInput` |\n| Pinia stores | camelCase + `.store.ts` | `tasks.store.ts`, `ui.store.ts` |\n| Composables | `use` prefix | `useTasks.ts`, `useStorage.ts` |\n| Types/Interfaces | PascalCase | `Task`, `TaskFilter`, `Notification` |\n| Utils | camelCase | `generateId`, `storageKey` |\n| Route names | `[module].[action]` | `task-manager.list` |\n| Store IDs | `[module]:[name]` | `task-manager:tasks`, `core:ui` |\n| Storage keys | `platform:[module]:[key]` | `platform:task-manager:tasks` |\n\n## File Structure Rules\n\n- **One component per file.** No multi-export `.vue` files.\n- **Views = route targets only.** Views compose components; they don't contain UI logic.\n- **Composables own business logic.** If a component has more than 2 computed values or methods, extract to a composable.\n- **Stores own state.** Components never write to state directly — always through store actions.\n- **No barrel files inside modules.** Import directly from the file.\n\n## Component Rules\n\n- Use `<script setup>` always — no Options API.\n- Define props with `defineProps<Interface>()` — typed, no `PropType`.\n- Use `defineModel()` for v-model bindings.\n- Keep template logic minimal — extract to composable when logic grows.\n- Use `Transition` / `TransitionGroup` for all show/hide and list animations.\n\n## CSS Rules\n\n- Scoped styles for components (`<style scoped>`).\n- Use CSS custom properties from `main.css` — never hardcode colors or spacing.\n- No inline styles except for dynamic values (e.g., `:style=\"{ width: \\`${n}%\\` }\"`).\n- Design token naming: `--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--t-*`.\n\n## Store Rules\n\n- Use Composition API style (`defineStore('id', () => { ... })`).\n- Store ID format: `[module]:[name]`.\n- Module stores use `useStorage()` for persistence.\n- Never call notification store from within a module store — do it in composables.\n\n## Import Aliases\n\nAlways use `@/` for absolute imports from `src/`:\n```ts\nimport { useStorage } from '@/core/composables/useStorage'\nimport { UiButton } from '@/ui'\n```\n\nNever use relative paths that go up more than one level (`../../`).\n\n## Comments\n\n- No comments explaining what code does (code is self-documenting).\n- Only comment non-obvious constraints or workarounds (the \"why\", never the \"what\").\n",W=`# Module: Currency

**Status:** Planned  
**Route:** \`/currency\`  
**Priority:** Medium  
**API:** [Frankfurter](https://www.frankfurter.app/) — free, no API key, ECB data, no rate limits

---

## Purpose

A live exchange rate viewer. Select currency pairs, see up-to-date rates, save favorites. A compact widget on the Dashboard shows your top pairs at a glance without opening the full module.

---

## Data Model

\`\`\`typescript
interface CurrencyPair {
  base: string      // 'USD'
  target: string    // 'EUR'
  rate: number      // 1.08
  updatedAt: string // ISO 8601
}

interface CurrencySettings {
  favorites: Array<{ base: string; target: string }>
  defaultBase: string   // default 'USD'
}
\`\`\`

**Storage key:** \`platform:currency:settings\`

---

## API — Frankfurter (no key required)

\`\`\`
# Latest rates from base currency
GET https://api.frankfurter.app/latest?from=USD&to=EUR,RUB,GBP,JPY

# Historical rates for sparkline
GET https://api.frankfurter.app/2024-01-01..2024-01-30?from=USD&to=EUR

# All supported currencies
GET https://api.frankfurter.app/currencies
\`\`\`

Response shape:
\`\`\`json
{
  "amount": 1.0,
  "base": "USD",
  "date": "2026-05-26",
  "rates": {
    "EUR": 0.9182,
    "RUB": 89.50,
    "GBP": 0.7891
  }
}
\`\`\`

Supported currencies: ~33 major world currencies (ECB basket). For crypto, CoinGecko (no key) can be added later.

---

## Architecture

\`\`\`
src/modules/currency/
  types/index.ts                — CurrencyPair, CurrencySettings
  stores/currency.store.ts      — Pinia store, favorites, cached rates
  composables/useCurrency.ts    — fetch logic, auto-refresh, rate helpers
  components/
    CurrencyPairRow.vue         — single pair: base → target, rate, change
    CurrencySelector.vue        — searchable dropdown to pick currencies
    CurrencySparkline.vue       — 7d rate history (simple SVG line)
    DashboardWidget.vue         — compact 3–5 pair widget for Dashboard
  views/CurrencyView.vue        — full module view
  index.ts                      — route definition
\`\`\`

---

## Features

### Full module view (\`/currency\`)
- Add/remove currency pairs
- See live rate for each pair
- Up/down change indicator (vs previous close)
- Last-updated timestamp per pair
- Auto-refresh every 60 seconds
- Historical sparkline (7d by default, toggle 30d)

### Dashboard widget
- Shows 3–5 favorite pairs in a compact card
- Colored indicators: green = up, red = down vs yesterday
- Click to navigate to full Currency module
- Fetches on widget mount, no background polling

---

## Component Responsibilities

### \`currency.store.ts\`
- \`settings: CurrencySettings\` — favorites list, persisted via \`useStorage\`
- \`rateCache: Record<string, { rates: Record<string, number>; date: string }>\` — in-memory only
- \`addFavorite(base, target)\` / \`removeFavorite(base, target)\`
- \`setRates(base, rates, date)\` — updates cache

### \`useCurrency.ts\`
- \`fetchRates(base, targets[])\` — calls Frankfurter API via \`useAsync\`
- \`getRate(base, target)\` — reads from cache
- \`autoRefresh(intervalMs)\` — sets up interval, cleans up on unmount
- \`allCurrencies\` — loaded once on mount

### \`CurrencyPairRow.vue\`
\`\`\`
┌─────────────────────────────────────────┐
│  USD → EUR       1.0823   ▲ +0.12%      │
│  [sparkline 7d]                          │
└─────────────────────────────────────────┘
\`\`\`

### \`DashboardWidget.vue\` (mounted in DashboardView)
\`\`\`
┌──────────────────┐
│ ◎ Currency       │
│ USD/EUR  1.0823  │
│ USD/RUB  89.50   │
│ USD/GBP  0.7891  │
└──────────────────┘
\`\`\`

---

## Planned Improvements

- Currency converter (type an amount, see result live)
- Price alert: notify when pair crosses a threshold
- Crypto prices via CoinGecko (free, no key, 50 calls/min)
- Base currency quick-switch in toolbar

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | Frankfurter API | Free, no key, ECB data, no rate limits, simple JSON |
| 2026-05-26 | No crypto initially | CoinGecko has different shape; add in v2 once core is working |
| 2026-05-26 | In-memory rate cache | Rates don't need to persist — always fresh on mount |
| 2026-05-26 | Dashboard widget separate component | Follows Notes/Docs pattern; widget is self-contained |
`,z=`# Module: Dashboard

**Route:** \`/\` (platform home)  
**Status:** ✅ Active

---

## Purpose

The main home page of the platform. Provides a real-time overview of the entire platform state — what's built, what's working, what needs attention, and what's coming next.

The dashboard is not a welcome screen — it's a **command center** for the developer working on the platform.

---

## What It Shows

| Section | Content |
|---------|---------|
| Stats strip | Active modules, task count, completion %, doc pages |
| Modules grid | All modules with status and live data |
| Platform Health | Architecture, TypeScript, build, tests, backend, deployment status |
| Roadmap | Now / Next / Later items from \`platform-notes.ts\` |
| Tech Debt | Known issues with severity levels |

---

## Architecture

\`\`\`
modules/dashboard/
├── index.ts                  → route definition (path: '')
├── data/
│   └── platform-notes.ts     → ROADMAP, TECH_DEBT, IDEAS, PLATFORM_STATUS
├── components/
│   ├── StatCard.vue           → numeric stat card
│   └── ModuleStatusCard.vue  → module card with live data slots
└── views/
    └── DashboardView.vue     → composes all sections
\`\`\`

### Data Sources

- **Live data:** \`useTasksStore\` for task counts and progress
- **Static content:** \`platform-notes.ts\` for roadmap, tech debt, ideas
- **Registry:** \`PLATFORM_MODULES\` from \`src/core/registry/modules.ts\`
- **Docs count:** \`TOTAL_DOC_PAGES\` from docs registry

### Design Decision: Static data files for editorial content
Roadmap items, tech debt, and ideas live in \`src/modules/dashboard/data/platform-notes.ts\` rather than a backend or markdown file. This is intentional — the dashboard data is editorial content that changes when development decisions change. A TypeScript file gives us type safety and co-location with the component that uses it.

When a backend is added in the future, these can be migrated to an API call via \`useAsync\`.

---

## Planned Improvements

### High priority
- **Responsive layout** — stat cards go 2×2 on \`md\`, 1-column on \`sm\`; detail panel stacks below list on \`sm\`

### Medium priority
- **Currency widget** — live rates for 3–5 favorite pairs; uses Frankfurter API; self-contained \`DashboardWidget.vue\` inside Currency module
- **Sprint/focus tracker** — simple "today's focus" text area saved to localStorage
- **Interactive roadmap** — check off nextTasks items from the dashboard directly

### Low priority
- **Recent activity feed** — last N events across modules (requires cross-module event system)
- **Build stats** — bundle size, TS errors count (from CI/build output)
- **Drag-to-prioritize** — reorder roadmap items within the detail panel

## Shipped Improvements

| Date | Feature | Details |
|------|---------|---------|
| 2026-05-26 | Module quick-launch | \`→\` button appears on hover in the module list for \`available\` modules; \`@click.stop\` navigates via \`useRouter\` without selecting the detail panel |

---

## Session Notes

### 2026-05-26 — Initial implementation
- Created as the platform home page (route \`/\`)
- Dashboard is placed in \`section: 'platform'\` in the module registry
- Uses live data from Task Manager store — demonstrates cross-module data access
- \`platform-notes.ts\` established as the editorial data pattern for platform-level content
`,K=`# Module: Documentation

**Route:** \`/docs\`, \`/docs/:slug\`  
**Status:** ✅ Active

---

## Purpose

An in-app documentation viewer. Read architecture decisions, conventions, patterns, and module guides without leaving the platform.

The documentation system is designed around a core principle: **docs live next to the code**. Markdown files in \`docs/\` are bundled at build time via Vite's glob import and rendered inside the app.

---

## How It Works

### Build-time loading
\`\`\`typescript
// Vite loads all .md files as raw strings at build time
const DOC_FILES = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
\`\`\`

This means docs are available instantly — no HTTP requests, no loading states.

### Routing
- \`/docs\` → index page with section grid
- \`/docs/architecture\` → renders \`/docs/architecture.md\`
- \`/docs/modules/task-manager\` → renders \`/docs/modules/task-manager.md\`

The slug from the URL maps directly to a file path via \`docs-registry.ts\`.

### Markdown rendering
Uses \`marked\` (v18) with GitHub Flavored Markdown enabled. Output is rendered via \`v-html\` with scoped \`:deep()\` styles for full typography control.

---

## Architecture

\`\`\`
modules/docs/
├── index.ts                → route definitions
├── data/
│   └── docs-registry.ts   → DOC_REGISTRY (sections + page definitions)
├── composables/
│   └── useDocs.ts         → glob loading, route-to-content mapping
├── components/
│   └── DocsSidebar.vue    → section navigation
└── views/
    └── DocsView.vue       → layout + markdown renderer
\`\`\`

### docs-registry.ts

Central map of all documentation pages. Each entry has:
- \`slug\` — URL path segment (\`architecture\`, \`modules/task-manager\`)
- \`label\` — display name in sidebar
- \`filePath\` — key in the glob map (\`/docs/architecture.md\`)

**When a new doc file is added**, add a corresponding entry to \`docs-registry.ts\`.

---

## Adding New Documentation

1. Create a markdown file in \`docs/\` or \`docs/modules/\`
2. Add an entry to \`DOC_REGISTRY\` in \`src/modules/docs/data/docs-registry.ts\`
3. The file is automatically available at \`/docs/[slug]\`

---

## Documentation Discipline

This platform follows an explicit documentation rule:

> **Whenever we work on a module and make decisions — including future plans, design directions, rejected approaches, or constraints — the relevant documentation file is updated in the same session.**

This means:
- If we decide to add localization to Task Manager → update \`docs/modules/task-manager.md\`
- If we change the folder structure convention → update \`docs/conventions.md\`
- If a new architectural pattern is established → update \`docs/patterns.md\`
- If a new module is planned → add a doc stub to \`docs/modules/\`

---

## Planned Improvements

### High priority
- **Responsive** — on \`sm\`: sidebar collapses to a top dropdown / hamburger; content takes full width

### Medium priority
- **Full-text search** — search bar in DocsSidebar; filter pages by content (all docs in memory already); highlight matches

### Low priority
- **Table of contents** — auto-generate from headings in current doc; sticky sidebar on right
- **Last-updated timestamps** — git-based, inject at build time via Vite plugin
- **Collapsible sidebar sections** — toggle sections in DocsSidebar when doc count grows
- **Print / export** — export current doc as PDF using \`window.print()\` + print stylesheet

## Shipped Improvements

| Date | Feature | Details |
|------|---------|---------|
| 2026-05-26 | Anchor links on headings | Custom \`marked\` renderer adds \`id\` attribute + \`.anchor-link\` \`#\` element to every heading; appears on hover via CSS |
| 2026-05-26 | Copy button on code blocks | Injected via \`watch(renderedHtml)\` + \`nextTick\`; \`data-copy-attached\` attribute prevents duplicate injection; \`navigator.clipboard.writeText\` |

---

## Session Notes

### 2026-05-26 — Initial implementation
- Chose \`marked\` over \`vue-markdown-it\` — simpler API, no Vue wrapper dependency
- Chose \`import.meta.glob\` with \`eager: true\` — docs load instantly, no lazy-load complexity
- Docs registry is a separate data file (not auto-discovered) — explicit control over what's visible
- DocsView handles both index (\`/docs\`) and page (\`/docs/:slug\`) in one component — avoids nested router complexity
`,q=`# Notes Module

**Status:** Available (v1.0)  
**Route:** \`/notes\`  
**Storage key:** \`platform:notes:notes\`

---

## Purpose

A distraction-free markdown note-taking workspace. Notes are plain text with Markdown support, rendered live in a split preview. The module is designed for developer notes, ideas, code snippets, and personal reference material.

---

## Data Model

\`\`\`typescript
interface Note {
  id: string          // crypto.randomUUID()
  title: string       // derived from content, not stored separately
  content: string     // raw markdown
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601, updated on every auto-save
}
\`\`\`

**Title extraction rules (in priority order):**
1. First \`# Heading\` line (strip the \`# \` prefix)
2. First non-empty line (truncated to 80 chars)
3. Fallback: \`"Untitled"\`

Title is derived at read time — not stored in the model.

---

## Architecture

### Directory layout

\`\`\`
src/modules/notes/
  types/index.ts          — Note interface + RawNote (stored shape)
  stores/notes.store.ts   — Pinia store, localStorage persistence
  composables/useNotes.ts — editor state, debounced save, mode switching
  components/
    NoteList.vue          — scrollable note list with search
    NoteListItem.vue      — single row: title, date, excerpt
    NoteEditor.vue        — textarea with Tab-key support
    NotePreview.vue       — marked HTML render
  views/NotesView.vue     — three-column workspace (list | editor | preview)
  index.ts                — route definitions
\`\`\`

### Layout

Three-pane workspace, fullbleed (no outer padding):

\`\`\`
┌──────────────────┬──────────────────────┬─────────────────────┐
│  Note List       │  Editor              │  Preview            │
│  (240px)         │  (flex 1)            │  (flex 1)           │
│  - search        │  - plain textarea    │  - rendered HTML    │
│  - new note btn  │  - tab → 2 spaces    │  - same styles as   │
│  - note rows     │                      │    docs module      │
└──────────────────┴──────────────────────┴─────────────────────┘
\`\`\`

Mode selector (top bar): **Edit** · **Split** · **Preview**

- \`edit\` — only editor pane visible
- \`split\` — editor + preview side by side
- \`preview\` — only preview pane visible

---

## Component Responsibilities

### \`notes.store.ts\`
- \`notes: Note[]\` — reactive array, persisted via \`useStorage\`
- \`createNote()\` — inserts new empty note at top, returns id
- \`updateContent(id, content)\` — updates content + updatedAt
- \`deleteNote(id)\` — removes from array
- Computed: \`sortedNotes\` — sorted by updatedAt descending

### \`useNotes.ts\` composable
- \`selectedId: Ref<string | null>\` — currently open note
- \`mode: Ref<'edit' | 'split' | 'preview'>\` — editor display mode
- \`searchQuery: Ref<string>\` — list filter
- \`filteredNotes\` — computed from store.sortedNotes + searchQuery
- \`selectedNote\` — computed: the full Note object
- \`debouncedSave(content)\` — calls \`store.updateContent\` after 300ms
- \`selectNote(id)\` — sets selectedId
- \`newNote()\` — calls store.createNote(), selects the new note

### \`NoteEditor.vue\`
- Props: \`modelValue: string\`
- Emits: \`update:modelValue\`
- Tab key: inserts 2 spaces at cursor position (no \`nextTick\` workaround needed with direct DOM manipulation)

### \`NotePreview.vue\`
- Props: \`content: string\`
- Renders via \`marked.parse()\`, same \`:deep()\` typography as DocsView

---

## Editor Modes

| Mode | List visible | Editor visible | Preview visible |
|------|-------------|----------------|-----------------|
| edit | ✓ | ✓ | — |
| split | ✓ | ✓ | ✓ |
| preview | ✓ | — | ✓ |

Default mode: \`split\`

---

## Persistence

\`\`\`typescript
// Storage key
storageKey('notes', 'notes')  // → "platform:notes:notes"

// Store ID
defineStore('notes:notes', ...)
\`\`\`

---

## Keyboard Shortcuts (v2)

| Key | Action |
|-----|--------|
| Tab | Insert 2 spaces at cursor |
| ⌘N | Create a new note |
| ⌘F | Focus the search input |
| ⌘⇧P | Toggle preview mode (split ↔ preview) |

Shortcuts are registered in \`NotesView.vue\` via \`window.addEventListener('keydown')\` with \`onMounted\`/\`onUnmounted\` lifecycle hooks. \`NoteList\` exposes \`focusSearch()\` via \`defineExpose\`.

---

## Planned Improvements

### High priority
- **Responsive** — on \`sm\`: single-pane only (no split), note list slides in from left as overlay
- **Word count + reading time** — computed from \`selectedNote.content\`; display in toolbar (e.g. \`234 words · 1 min read\`); zero new dependencies

### Medium priority
- **Export as .md file** — \`Blob\` + \`<a download>\` click; single function, ~5 lines
- **Pinned notes** — add \`pinned: boolean\` to Note type, sort pinned first, pin button on \`NoteListItem\` hover
- **Note templates** — dropdown with presets: daily standup, meeting notes, idea dump

### Low priority
- **Code block syntax highlighting** — \`highlight.js\` or \`prism.js\` in preview; add after other items
- **Tag system** — \`tags: string[]\` on Note, tag filter in NoteList sidebar header
- **Note drag-to-reorder** — native HTML5 DnD on NoteListItem

## Known Limitations (v1)

- No folder/notebook organization
- No inter-note linking
- No export (PDF, markdown file)
- No code syntax highlighting in preview
- Title is re-derived on every render (acceptable for v1 list sizes)

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | No rich-text editor library | \`marked\` already installed; textarea gives full control; no bundle bloat |
| 2026-05-26 | Title derived from content | Avoids title/content sync bugs; single source of truth |
| 2026-05-26 | \`meta.fullbleed: true\` on route | Notes needs full viewport height; outer layout padding would clip the editor |
| 2026-05-26 | 300ms debounce on save | Fast enough to feel instant; avoids per-keystroke localStorage writes |
| 2026-05-26 | Default mode: split | Most useful out of the box; shows markdown is rendering immediately |
`,$=`# Module: Task Manager

**Route:** \`/tasks\`  
**Status:** ✅ Active  
**Migrated from:** \`project 1/task-manager\` (vanilla JS, single-component)

---

## Purpose

A personal task management tool. Create tasks, mark them done, filter by status, track progress.

The vision goes beyond a "demo app" — Task Manager should be treated as a **real product** that could be extracted, branded, and sold independently. Think of it as a focused, polished micro-SaaS.

---

## Product Vision

> "A minimal task manager with strong opinions about focus, visual clarity, and speed."

### Planned Product Identity
- **Name:** TBD (not "Task Manager" — needs a real product name)
- **Positioning:** For developers and knowledge workers who want a distraction-free way to track daily tasks
- **Differentiator:** Beautiful dark-first design, keyboard-friendly, no accounts needed
- **Target:** Extractable as a standalone web app + potentially mobile-ready PWA

### Design Direction
- Dark-first, high contrast, developer-aesthetic
- Minimal chrome — content is always in focus
- Micro-interactions on every action (add, complete, delete)
- Consider a signature monospace font treatment for task text
- Potential for a unique accent color different from the platform blue

---

## Current Features

| Feature | Status |
|---------|--------|
| Create tasks (max 120 chars) | ✅ |
| Toggle task done/active | ✅ |
| Delete individual tasks | ✅ |
| Filter: All / Active / Done | ✅ |
| Progress bar with stats | ✅ |
| Clear all completed | ✅ |
| Persist to localStorage | ✅ |
| Dark / light theme | ✅ (platform-level) |
| Character limit counter | ✅ |
| Keyboard submit (Enter) | ✅ |
| Empty state | ✅ |
| Toast notifications | ✅ |

---

## Architecture

\`\`\`
modules/task-manager/
├── index.ts                → route definition
├── types/index.ts          → Task, TaskFilter
├── stores/tasks.store.ts   → Pinia store (state + actions)
├── composables/useTasks.ts → UI logic + notifications bridge
├── components/
│   ├── TaskInput.vue       → input field + Add button
│   ├── TaskFilters.vue     → All/Active/Done tab switcher
│   ├── TaskItem.vue        → single task row
│   ├── TaskList.vue        → animated TransitionGroup list
│   └── TaskProgress.vue    → progress bar + stats
└── views/
    └── TaskManagerView.vue → root view, composes all above
\`\`\`

### Data Flow
\`\`\`
TaskManagerView
  → useTasks() composable
      → useTasksStore (Pinia)
          → useStorage('platform:task-manager:tasks', [])
              → localStorage
      → useNotificationsStore (for toasts)
\`\`\`

---

## Types

\`\`\`typescript
type TaskFilter = 'all' | 'active' | 'done'

interface Task {
  id: string        // generateId() — timestamp-based
  text: string      // max 120 chars
  done: boolean     // completion status
  createdAt: number // Date.now()
}
\`\`\`

---

## Storage

**Key:** \`platform:task-manager:tasks\`  
**Format:** JSON array of \`Task[]\`

---

## Migration Notes

Original was a vanilla JS monolith (\`App.vue\` with 400+ lines). Refactored to:
- Full TypeScript with strict types
- Pinia store with \`useStorage\` composable
- 5 focused components + 1 composable
- Namespaced localStorage key
- Integrated with platform notification system
- Theme managed by platform \`ui.store\`

---

## Planned Improvements

### High priority
- **Responsive layout** — full-width on all screens, touch-friendly tap targets (≥ 44px)
- **Priority levels** — \`low / medium / high / urgent\` as color-coded dot on each task; single \`priority\` field in Task type; no new dependencies
- **Undo last delete** — save deleted task in a ref, show 4s toast with "Undo" action button; \`cancelRef = setTimeout(...)\` pattern

### Medium priority
- **Keyboard navigation** — j/k move focus between tasks, space to toggle, d to delete, / to focus input
- **Due dates** — date field in Task type, calendar input, urgency color (red = overdue, orange = today)
- **Product name + branding** — unique name, logo, accent color

### Low priority
- **Localization (vue-i18n)** — EN + RU, task-manager is reference impl
- **Task drag-to-reorder** — native HTML5 DnD or @vueuse/core
- **Export** — CSV, JSON, plain text download

### Shipped
- **Task inline editing (2026-05-26)** — double-click active task text to edit in-place; \`Enter\` commits, \`Esc\` cancels
- **Inline edit input font (2026-05-26)** — edit input inherits font and size (16px) from task text

### Long-term / Ideas
- Recurring tasks (daily, weekly)
- Subtasks / nested structure
- Task categories / projects
- Export: CSV, JSON, plain text
- Statistics view: completion rate over time, average tasks per day
- Integration with Kanban module (move task to board)

---

## Localization Plans

> **Decision (2026-05-26):** Task Manager will support multiple languages via \`vue-i18n\`. This is a platform-wide requirement, but Task Manager will be the reference implementation for the i18n pattern.

### Requirements
- All UI strings must be externalized (no hardcoded English in templates)
- Default locale: English (\`en\`)
- First additional locale: to be decided (Russian is a strong candidate)
- Locale files: \`src/modules/task-manager/locales/en.json\`, \`ru.json\`, etc.
- Platform locale selector in Settings (future module)

### Strings to externalize
- Placeholder: "Add a new task…"
- Button labels: "Add", "Clear completed"
- Filter labels: "All", "Active", "Done"
- Empty state: "No tasks here"
- Notifications: "Task added", "Task removed", "Cleared N completed tasks"
- Counter: "N tasks", "N remaining", "N done"
- Validation: "Task cannot exceed 120 characters"

### Architecture pattern (to be implemented)
\`\`\`typescript
// composables/useTasksI18n.ts
import { useI18n } from 'vue-i18n'

export function useTasksI18n() {
  const { t } = useI18n({ useScope: 'local' })
  return { t }
}
\`\`\`

---

## Known Issues

- No input validation beyond length (no duplicate detection)
- Tasks have no order control (only creation-order)
- localStorage has no migration strategy if Task schema changes

---

## Session Notes

### 2026-05-26 — Initial migration and platform integration
- Migrated from vanilla JS single-component to full TypeScript module
- Established the module architecture pattern used by all future modules
- Defined \`useStorage\` and \`useAsync\` core composables from Task Manager's needs
- Identified localization as a future platform-wide requirement
- User intent: treat Task Manager as a real product, not a demo — future branding, marketing positioning, potential standalone deployment
`,j=`# Reusable Patterns

## Persistent Reactive State

Use \`useStorage()\` to create a ref that auto-syncs to localStorage:

\`\`\`ts
// In a Pinia store
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'

const items = useStorage<Item[]>(storageKey('my-module', 'items'), [])
\`\`\`

The key is namespaced automatically. \`storageKey('my-module', 'items')\` → \`platform:my-module:items\`.

---

## Async Operations

Use \`useAsync()\` for any async call (future API requests):

\`\`\`ts
import { useAsync } from '@/core/composables/useAsync'

const { data, loading, error, execute } = useAsync(fetchTasks)

// In template:
// <div v-if="loading">…</div>
// <div v-else-if="error">{{ error }}</div>
// <div v-else>{{ data }}</div>
\`\`\`

---

## Notifications

Never import \`useNotificationsStore\` in components. Use it in composables:

\`\`\`ts
// In a composable
import { useNotificationsStore } from '@/core/stores/notifications.store'
const notify = useNotificationsStore()

notify.success('Task added')
notify.error('Something went wrong')
notify.warning('Limit reached')
notify.info('3 tasks cleared')
\`\`\`

---

## Module Composable Pattern

The standard pattern for a module composable:

\`\`\`ts
// composables/useMyFeature.ts
export function useMyFeature() {
  const store = useMyFeatureStore()
  const notify = useNotificationsStore()

  // local UI state (not persisted)
  const inputText = ref('')

  // actions that combine store + notifications
  function submit() {
    if (!inputText.value.trim()) return
    store.addItem(inputText.value)
    inputText.value = ''
    notify.success('Item added')
  }

  return { inputText, submit, store }
}
\`\`\`

The view only calls \`useMyFeature()\` — it never calls the store or notify directly.

---

## View Structure

\`\`\`vue
<script setup lang="ts">
// 1. Import composable(s)
const { inputText, submit, store } = useMyFeature()
<\/script>

<template>
  <div class="view-wrapper">
    <!-- Delegate everything to components -->
    <MyInput v-model="inputText" @submit="submit" />
    <MyList :items="store.filteredItems" @delete="store.deleteItem" />
  </div>
</template>

<style scoped>
/* Only layout rules — no component-level styling here */
.view-wrapper { max-width: var(--content-max-width); margin: 0 auto; }
</style>
\`\`\`

---

## Animation Conventions

List items always use \`TransitionGroup\` with these class names:

\`\`\`css
.item-enter-active { transition: all 200ms var(--ease-spring); }
.item-leave-active { transition: all 160ms var(--ease); position: absolute; width: 100%; }
.item-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.98); }
.item-leave-to     { opacity: 0; transform: translateX(10px); }
.item-move         { transition: transform 200ms var(--ease); }
\`\`\`

Page transitions are handled by \`AppLayout.vue\`. No module needs to implement its own page transition.

---

## ID Generation

Always use \`generateId()\` from \`@/core/utils/id\`. Never use \`Date.now()\` directly as an ID:

\`\`\`ts
import { generateId } from '@/core/utils/id'

const newItem = { id: generateId(), ... }
\`\`\`

---

## Theme-Aware Styling

All colors must come from CSS custom properties. The theme is switched by toggling \`data-theme="light"\` on \`<html>\`:

\`\`\`css
/* Works in both themes automatically */
color: var(--color-text);
background: var(--color-surface);
border: 1px solid var(--color-border);
\`\`\`

Never hardcode \`#hex\` or \`rgb()\` values for semantic colors.
`,J=`# VibeOS — Platform Overview

**VibeOS** is a modular engineering workspace built with Vue 3 — a single codebase containing multiple independent apps. Designed as a real product, not a demo. Built in the vibe coding era with AI-assisted development.

---

## Vision

Build a platform that feels like a real product suite — not a collection of demos.

Each app should be:
- Independently useful
- Architecturally consistent
- Visually polished
- Production-ready in its own right

The platform demonstrates mastery of:
- Scalable Vue 3 architecture
- TypeScript and type safety
- State management patterns (Pinia)
- Composable-driven development
- Reusable UI systems
- AI-assisted development workflows (Claude)

---

## Goals

| Goal | Description |
|------|-------------|
| Learning | Modern frontend engineering: Vue 3, Vite, TypeScript, Pinia |
| Architecture | Scalable, modular, maintainable patterns |
| AI Workflows | Using Claude as a senior engineering assistant |
| Portfolio | Demonstrating real product thinking and engineering quality |
| Long-term | A codebase that grows and improves over time |

---

## Current State

**Product name:** VibeOS  
**Version:** 0.1.0  
**Active apps:** Dashboard, Docs, Tasks, Notes  
**Architecture:** ✅ Clean and layered  
**TypeScript:** ✅ Strict mode, 0 errors  
**Tests:** ❌ Not yet implemented  
**Backend:** ❌ localStorage only  
**Deployment:** ❌ Not yet deployed

---

## Tech Stack

- **Vue 3** — Composition API, \`<script setup>\`
- **Vite 6** — Build tool, dev server, glob imports
- **TypeScript 5** — Strict mode
- **Pinia 2** — State management
- **Vue Router 4** — Client-side routing with lazy loading
- **Geist** — Primary typeface (Vercel's open-source font)
- **marked 18** — Markdown rendering

---

## App Roadmap

| App | Status | Description |
|-----|--------|-------------|
| Dashboard | ✅ Active | Platform overview and module control center |
| Docs | ✅ Active | In-app markdown documentation viewer |
| Tasks | ✅ Active | Task creation, filtering, persistence |
| Notes | ✅ Active | Markdown notes with live split preview |
| Board | 🔜 Planned | Visual workflow board with drag-and-drop |
| Studio | 🔜 Planned | Claude API experiments and prompt builder |
| Forms | 🔜 Planned | Drag-and-drop form designer |
| Insights | 🔜 Planned | Usage tracking and metrics |

---

## Development Philosophy

- **Architecture first** — design decisions are documented before code is written
- **Patterns over improvisation** — new code follows established patterns in \`/docs/patterns.md\`
- **Spec before implementation** — every new module starts with a written spec in \`docs/modules/\`
- **Product quality** — every screen should feel like it belongs in a real product
- **Vibe-coded** — AI-assisted development, fast iteration, high standards

---

## Branding

| Token | Value |
|-------|-------|
| Product name | VibeOS |
| Logo mark | \`//\` (double slash — universal code comment symbol) |
| Accent color | \`#4f8ef7\` |
| Font | Geist (headings + body) + JetBrains Mono (code) |
| Brand tone | Precise · Composed · Alive |
| Tagline direction | *Your engineering workspace* |
`,Y=`# Roadmap

This document tracks what we're building, what's next, and the ideas backlog.

---

## App Planning Discipline

> **Rule (added 2026-05-26):** No app should be implemented without a written specification first.

Before starting any new app:

1. **Write the spec** — create \`docs/modules/[name].md\` with purpose, data model, component architecture, and open questions
2. **Define the data model** — TypeScript interfaces for the main entities
3. **Choose dependencies** — libraries, patterns, architectural decisions
4. **Add to dashboard** — update \`MODULE_DETAILS\` in \`platform-notes.ts\` with nextTasks and notes
5. **Only then implement** — following the established module pattern

This prevents scope creep and ensures every app has clear intent before code is written.

### Which app to build next?

**Notes chosen and built (2026-05-26).** Rationale: immediately useful, low dependency surface, established the fullbleed workspace layout pattern that Board will also use.

**Remaining candidates:**

| App | Reason to build next | Complexity |
|-----|---------------------|------------|
| Board | Visually impressive, reuses Notes workspace layout, natural Tasks complement | High |
| Studio | Most portfolio-visible, Claude API is relevant and modern | Medium |

> Next decision pending. Board is the current frontrunner.

---

## Now

Nothing currently in active sprint. VibeOS foundation (Dashboard, Docs, Tasks, Notes) is complete.

### Recently shipped (2026-05-26)

| Feature | Module | Details |
|---------|--------|---------|
| Module quick-launch button | Dashboard | \`→\` button on hover navigates directly to any available module |
| Copy button on code blocks | Docs | Appears on hover over \`<pre>\`, uses \`navigator.clipboard\` |
| Anchor links on headings | Docs | \`#\` link appears on hover, updates URL hash for deep-linking |
| Keyboard shortcuts | Notes | \`⌘N\` new note · \`⌘F\` focus search · \`⌘⇧P\` toggle preview mode |
| Inline task editing | Tasks | Double-click any active task text to edit in-place; \`Enter\` to save, \`Esc\` to cancel |

---

## Next

Prioritized features for the next development sessions:

### 1. Board app
- Visual board with columns (To Do / In Progress / Done)
- Card creation, editing, drag-and-drop reorder
- Persisted to localStorage via \`useStorage\`
- Follows Tasks patterns for types/store/composable
- Fullbleed workspace layout (same pattern as Notes)

### 2. Tasks — Product Identity
- Choose a standalone product name (not just "Tasks")
- Define visual identity: logo, accent color, typography personality
- Marketing-style positioning: what problem it solves, who it's for
- Treat it as a real product that could be extracted and sold

### 3. Localization infrastructure
- Add \`vue-i18n\` as the i18n solution
- Create a locale composable that wraps \`useI18n\`
- Implement English as default + Russian
- All apps must support locale strings — no hardcoded UI text

### 4. Notes app ✅ Done (2026-05-26)
- Markdown editor with live preview (split-pane) ✓
- Note list with titles, dates, search ✓
- Auto-save with 300ms debounce ✓
- Persisted to localStorage ✓
- Fullbleed workspace layout ✓

---

## Medium priority

Features worth building after the "Next" sprint:

### Open API widgets *(medium — pick any one for a quick win)*

| Widget | API | Key | Effort |
|--------|-----|-----|--------|
| **Currency rates** | Frankfurter | No | Low — spec written |
| **GitHub stats** | GitHub REST | No (public) | Medium |
| **Hacker News feed** | HN Algolia | No | Low |
| **Weather** | OpenWeatherMap | Free key | Low |
| **Crypto prices** | CoinGecko | No | Low |
| **Dev jokes** | JokeAPI | No | Trivial |
| **NASA photo** | NASA APOD | Free key | Low |
| **World time** | worldtimeapi.org | No | Low |

Most immediately useful: Currency (already specced) → GitHub stats → HN feed → Weather.

---

## ⚡ HIGH PRIORITY — Design & visual identity

> **Added 2026-05-26.** The platform works well technically but needs a proper design pass before it looks like a real product.

### What needs to happen

**Logo & brand identity**
- The current \`//\` text logo is a placeholder — design a real logotype or icon mark
- Define a consistent brand personality: is VibeOS minimal/corporate or playful/hacker?
- Choose a secondary accent color (or stick to mono with single accent)

**Global UI polish**
- Sidebar: improve visual hierarchy, active state, icons (currently unicode glyphs)
- Header / app bar: more deliberate spacing and weight
- Typography: consider a proper heading/body size contrast rather than just bumping px
- Spacing: audit padding/gap values for consistency — many are one-off
- Module headers: each module's header area should feel intentional, not boilerplate

**Component library**
- Standardize button variants: primary / secondary / ghost / destructive
- Input fields: consistent height, border, focus ring across all modules
- Cards / panels: define a single card pattern instead of per-module one-offs
- Eventually extract to a \`src/ui/\` design system (some already there: \`UiButton\`)

**CSS architecture**
- All font-size values are still hardcoded in components — they should use \`--text-*\` scale variables from \`main.css\`
- Audit components to gradually replace hardcoded px with \`--text-*\` variables
- Add spacing scale variables: \`--space-1\` through \`--space-8\`

---

## ⚡ HIGH PRIORITY — Responsive design

> **Rule (added 2026-05-26):** Every new component and module must include responsive styles from day one. See \`CLAUDE.md\` for the full rule and checklist.
>
> **Priority level: HIGH** — Must be done before any new module development begins.

### Target devices

| Breakpoint | Device | Width | Owner priority |
|------------|--------|-------|---------------|
| \`xl\` | Mac Studio Display (27" 5K) | ≥ 1920px | Primary |
| \`lg\` | MacBook Pro 14"/16" (default) | 1280–1919px | Primary |
| \`md\` | iPad / small laptop | 768–1279px | Secondary |
| \`sm\` | Mobile (iPhone) | < 768px | Required |

### Phase 1 — Layout foundation *(HIGH — do before next feature sprint)*
- CSS breakpoint variables in \`main.css\`
- Sidebar: collapses to icon-only on \`md\`, becomes bottom tab bar on \`sm\`
- AppLayout: stacks vertically on \`sm\`
- Content padding scales: 32px → 20px → 14px

### Phase 2 — Per-module responsive *(per module, when built or polished)*
- Dashboard: stat cards 2×2 on \`md\`, 1-column on \`sm\`
- Notes: hide preview on \`sm\`, collapsible note list on \`sm\`
- Docs: sidebar becomes top dropdown on \`sm\`
- Tasks: already flexible, minor padding adjustments only

### Phase 3 — Mac Studio Display optimization *(later)*
- Content max-width increases to \`1200px\` for \`xl\`
- Wider sidebar option for large displays

---

## Deployment — free hosting

> **Added 2026-05-26.** Target: live on the internet, zero cost, permanent URL.

### Options (all free, all good for a Vite SPA)

| Service | Notes | Custom domain | Verdict |
|---------|-------|---------------|---------|
| **GitHub Pages** | Free forever, deploys from \`gh-pages\` branch or \`docs/\` folder, GitHub Actions CI | Yes (free) | ✓ Best for open-source |
| **Vercel** | Instant deploy on every push, preview URLs per PR, generous free tier | Yes (free) | ✓ Best DX overall |
| **Netlify** | Similar to Vercel, slightly older | Yes (free) | Good fallback |
| **Cloudflare Pages** | Fast CDN, unlimited bandwidth | Yes (free) | Good if already using CF |

**Recommendation: Vercel** — zero config for Vite, preview deployments per PR, custom domain in 1 click, never need to think about it again.

### What to do
1. Push repo to GitHub (already planned)
2. Connect repo to Vercel (vercel.com → "New Project" → import GitHub repo)
3. Build command: \`npm run build\` / Output dir: \`dist\`
4. Done — every push to \`main\` auto-deploys

For GitHub Pages (alternative):
- Add \`.github/workflows/deploy.yml\` with \`actions/upload-pages-artifact@v3\` + \`actions/deploy-pages@v4\`
- Set \`base: '/VibeOS/'\` in \`vite.config.ts\` (important for sub-path routing)

---

## Later

- **Studio** — Claude API integration, prompt builder with streaming, response explorer
- **Component Playground** — Design system viewer with interactive component demos
- **Global keyboard shortcuts** — ⌘K command palette, app-level shortcuts
- **Drag-and-drop** — Board cards + Tasks reordering (use \`@vueuse/core\` or native HTML5 DnD)
- **Deploy to Vercel** — Public deployment with GitHub Actions CI
- **Error boundaries** — Global error handler, app-level fallbacks
- **Test suite** — Vitest + Vue Test Utils for unit/component tests
- **Theme per app** — Allow app-level accent color customization

---

## Currency module (planned)

**Route:** \`/currency\`  
**Status:** Planned  
**API:** [Frankfurter](https://www.frankfurter.app/) — completely free, no API key, ECB data, no rate limits

### Purpose
Live exchange rate viewer. Select currency pairs, see real-time rates, track favorites. Dashboard widget shows top pairs at a glance.

### Planned features
- Currency pair selector (from / to) with search
- Live rate display with last-updated timestamp
- Favorite pairs saved to localStorage
- Multi-pair view (watch several rates at once)
- Simple rate history sparkline (7d / 30d)
- Dashboard widget: top 3–5 favorite pairs

### Data model
\`\`\`typescript
interface CurrencyPair {
  base: string      // 'USD'
  target: string    // 'EUR'
  rate: number
  updatedAt: string
}

interface CurrencyState {
  favorites: CurrencyPair[]
  lastFetch: Record<string, number>  // base → timestamp
}
\`\`\`

### API endpoints (Frankfurter, no key needed)
\`\`\`
GET https://api.frankfurter.app/latest?from=USD&to=EUR,RUB,GBP
GET https://api.frankfurter.app/2024-01-01..?from=USD&to=EUR   // history
GET https://api.frankfurter.app/currencies                       // all currencies
\`\`\`

### Dashboard widget
Compact card on Dashboard showing 3–5 favorite pairs with colored up/down indicators. Updates on widget mount.

---

## Open API ideas backlog

Ideas for future modules using free/open APIs (no paid tier required):

| Idea | API | Key needed | Complexity |
|------|-----|-----------|------------|
| **Weather widget** | OpenWeatherMap free | Yes (free) | Low |
| **Crypto prices** | CoinGecko | No | Low |
| **GitHub stats** | GitHub REST API | No (public) | Medium |
| **Hacker News feed** | HN Algolia API | No | Low |
| **Dev jokes widget** | JokeAPI | No | Trivial |
| **NASA photo of the day** | NASA APOD | Yes (free) | Low |
| **IP / geo info** | ip-api.com | No | Low |
| **Random Wikipedia** | Wikipedia API | No | Low |
| **QR code generator** | goqr.me | No | Trivial |
| **Color palette** | TheColorAPI | No | Low |
| **Public holidays** | Nager.Date API | No | Low |
| **World time / timezone** | worldtimeapi.org | No | Low |

**Most immediately useful for developers:**
1. GitHub stats (commits, open PRs, stars on repos)
2. Hacker News top stories feed
3. Weather widget (location-based)
4. Crypto prices (BTC/ETH/SOL quick view)

---

## Games module

> **Added 2026-05-26.** A dedicated Games section inside VibeOS — classic games, beautifully implemented with consistent dark UI style.

Each game is its own sub-route under \`/games/[name]\` with a shared game launcher/lobby page at \`/games\`.

### Recommended games — ranked by fun-to-effort ratio

| Game | Why it's great | Tech needed | Effort |
|------|---------------|-------------|--------|
| **2048** | Smooth tile animations, satisfying merge physics, pure CSS grid | Vue + CSS transitions | Low |
| **Memory Cards** | Beautiful CSS flip animations, variable grid sizes, theme-able card backs | Vue + CSS 3D transforms | Low |
| **Minesweeper** | Tension + logic, right-click flagging, auto-reveal flood-fill | Vue + CSS grid | Low |
| **Snake** | Addictive, fits the dark terminal aesthetic perfectly | Canvas + \`requestAnimationFrame\` | Low-medium |
| **Wordle clone** | Instantly recognizable, keyboard input, green/yellow/grey tiles | Vue + word list JSON | Medium |
| **Tetris** | Most visually impressive, fits the VibeOS grid aesthetic | Canvas or CSS grid | Medium |
| **Pong** | Minimal and elegant, optionally vs AI | Canvas | Medium |

### Start with these 3 (best ROI)

1. **2048** — no canvas needed, pure CSS grid + transitions, will look beautiful in dark theme
2. **Memory Cards** — CSS 3D flip is visually stunning, dead simple logic
3. **Snake** — retro terminal aesthetic is perfect for VibeOS brand

### Shared architecture
- Route: \`/games\` → lobby page with game grid
- Each game: \`/games/2048\`, \`/games/snake\`, etc.
- Shared: \`useGameLoop\` composable for canvas games, \`useHighScore\` for localStorage persistence
- Each game should have: high score display, difficulty picker, keyboard shortcuts

---

## Ideas Backlog

### Tasks
- Due dates with calendar picker
- Priority levels (low / medium / high / urgent)
- Recurring tasks
- Subtasks / nested task trees
- Export to CSV / JSON
- Keyboard-first navigation

### VibeOS Platform
- Global search (⌘K) across all apps
- Activity log / history per app
- User profile (avatar, display name — even if mock)
- Platform analytics: which apps are used most

### Board (future)
- Swimlanes
- Labels and colors
- Assignees (even if mock)
- Sprint planning view
- Board import from Trello / Linear JSON

### Notes (future)
- Folder / notebook organization
- Links between notes (wiki-style)
- Code block syntax highlighting
- Export to PDF

---

## Technical Improvements

| Item | Priority | Notes |
|------|----------|-------|
| Add Vitest + Vue Test Utils | High | Start with composable unit tests |
| Error boundaries | High | Global + app-level fallback UI |
| localStorage migration strategy | Medium | Schema versioning for stored data |
| Loading skeletons | Medium | For any future async operations |
| Route-level code splitting audit | Low | Verify lazy loading works correctly |

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | \`marked\` for markdown rendering | Simple API, no Vue wrapper needed, good TypeScript support |
| 2026-05-26 | Static data files for dashboard notes | Keeps content close to code, easy to migrate to API later |
| 2026-05-26 | Module \`section\` field in registry | Enables multi-section sidebar without breaking existing modules |
| 2026-05-26 | Dashboard at \`/\` (not \`/dashboard\`) | Home page should always be the platform overview |
| 2026-05-26 | Notes: textarea + marked, no editor lib | Zero bundle cost, full control, marked already installed |
| 2026-05-26 | Platform rebranded to VibeOS | Developer culture identity; \`//\` logo; Geist font |
| 2026-05-26 | Sidebar sections: System / Apps | Cleaner than Platform/Modules; matches VibeOS OS metaphor |
`,T=Object.assign({"/docs/architecture.md":G,"/docs/conventions.md":H,"/docs/modules/currency.md":W,"/docs/modules/dashboard.md":z,"/docs/modules/docs.md":K,"/docs/modules/notes.md":q,"/docs/modules/task-manager.md":$,"/docs/patterns.md":j,"/docs/platform.md":J,"/docs/roadmap.md":Y});function Q(){const b=R(),c=w(()=>{const i=b.params.slug;return i?Array.isArray(i)?i.join("/"):i:""}),h=w(()=>c.value?B(c.value):null),u=w(()=>h.value?T[h.value.filePath]??null:null);function p(i){return T[i]??null}return{DOC_REGISTRY:O,DOC_FILES:T,currentSlug:c,currentPage:h,currentContent:u,getContent:p}}const X={class:"docs-nav"},Z={class:"docs-nav__search-wrap"},ee=["onClick"],ne={class:"docs-nav__chevron"},te={key:0,class:"docs-nav__pages"},oe=["onClick"],se={class:"docs-nav__item-label"},ae={key:0,class:"docs-nav__snippet"},re={key:0,class:"docs-nav__empty"},ie=I({__name:"DocsSidebar",props:{sections:{},activeSlug:{}},setup(b){const c=b,h=x(),u=P(""),p=P(new Set);function i(t){p.value.has(t)?p.value.delete(t):p.value.add(t),p.value=new Set(p.value)}function k(t,l){const e=t.toLowerCase().indexOf(l);if(e===-1)return"";const o=Math.max(0,e-25),d=Math.min(t.length,e+55);let g=t.slice(o,d).replace(/\n+/g," ").replace(/#+\s*/g,"").trim();return o>0&&(g="…"+g),d<t.length&&(g+="…"),g}const y=w(()=>{const t=u.value.trim().toLowerCase();return t?c.sections.map(l=>{var e;const n=[];for(const o of l.pages){if(o.label.toLowerCase().includes(t)||(((e=o.description)==null?void 0:e.toLowerCase().includes(t))??!1)){n.push(o);continue}const g=T[o.filePath];g&&g.toLowerCase().includes(t)&&n.push({...o,snippet:k(g,t)})}return{...l,pages:n}}).filter(l=>l.pages.length>0):c.sections}),v=t=>!u.value.trim()&&p.value.has(t);return(t,l)=>(r(),a("nav",X,[s("div",Z,[M(s("input",{"onUpdate:modelValue":l[0]||(l[0]=n=>u.value=n),class:"docs-nav__search",type:"search",placeholder:"Search docs…","aria-label":"Search documentation"},null,512),[[L,u.value]])]),(r(!0),a(A,null,C(y.value,n=>(r(),a("div",{key:n.id,class:"docs-nav__section"},[s("button",{class:D(["docs-nav__label",{"docs-nav__label--collapsed":v(n.id)}]),onClick:e=>i(n.id)},[s("span",null,f(n.label),1),s("span",ne,f(v(n.id)?"›":"⌄"),1)],10,ee),v(n.id)?S("",!0):(r(),a("div",te,[(r(!0),a(A,null,C(n.pages,e=>(r(),a("button",{key:e.slug,class:D(["docs-nav__item",{"docs-nav__item--active":b.activeSlug===e.slug}]),onClick:o=>m(h).push(`/docs/${e.slug}`)},[s("span",se,f(e.label),1),e.snippet?(r(),a("span",ae,f(e.snippet),1)):S("",!0)],10,oe))),128))]))]))),128)),y.value.length===0?(r(),a("p",re,"No results")):S("",!0)]))}}),le=N(ie,[["__scopeId","data-v-ab0d13b9"]]),de={class:"docs-layout"},ce={class:"docs-layout__nav"},ue={class:"docs-layout__content"},pe={key:0,class:"docs-home"},me={class:"docs-home__grid"},he={class:"docs-home__section-title"},ge=["onClick"],fe={class:"docs-home__link-label"},ye={key:0,class:"docs-home__link-desc"},ve={key:1,class:"docs-missing"},be={class:"docs-missing__sub"},we={key:2,class:"doc-article"},ke=["innerHTML"],Se=I({__name:"DocsView",setup(b){var l;const c=x(),{DOC_REGISTRY:h,currentSlug:u,currentPage:p,currentContent:i}=Q();_.use({gfm:!0,renderer:{heading({text:n,depth:e}){const o=n.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");return`<h${e} id="${o}"><a class="anchor-link" href="#${o}">#</a>${n}</h${e}>
`}}});const k=w(()=>{if(!i.value)return"";const n=_.parse(i.value);return typeof n=="string"?n:""}),y=P();E(k,async()=>{await F(),y.value&&y.value.querySelectorAll("pre:not([data-copy-attached])").forEach(n=>{n.setAttribute("data-copy-attached","");const e=document.createElement("button");e.className="copy-btn",e.textContent="copy",e.addEventListener("click",()=>{var d;const o=((d=n.querySelector("code"))==null?void 0:d.textContent)??"";navigator.clipboard.writeText(o),e.textContent="copied!",setTimeout(()=>{e.textContent="copy"},2e3)}),n.appendChild(e)})},{immediate:!0});const v=(l=h[0])==null?void 0:l.pages[0];function t(){v&&c.push(`/docs/${v.slug}`)}return(n,e)=>(r(),a("div",de,[s("aside",ce,[U(le,{sections:m(h),"active-slug":m(u)},null,8,["sections","active-slug"])]),s("main",ue,[m(u)?!m(p)||!m(i)?(r(),a("div",ve,[e[4]||(e[4]=s("p",{class:"docs-missing__title"},"Page not found",-1)),s("p",be,[e[3]||(e[3]=V("No documentation found for ",-1)),s("code",null,f(m(u)),1)]),s("button",{class:"docs-home__start",onClick:e[0]||(e[0]=o=>m(c).push("/docs"))},"Back to index")])):(r(),a("article",we,[s("div",{ref_key:"docContentRef",ref:y,class:"doc-content",innerHTML:k.value},null,8,ke)])):(r(),a("div",pe,[e[1]||(e[1]=s("h1",null,"Documentation",-1)),e[2]||(e[2]=s("p",{class:"docs-home__sub"},"Architecture decisions, patterns, and module guides for this platform.",-1)),s("div",me,[(r(!0),a(A,null,C(m(h),o=>(r(),a("div",{key:o.id,class:"docs-home__section"},[s("h3",he,f(o.label),1),(r(!0),a(A,null,C(o.pages,d=>(r(),a("button",{key:d.slug,class:"docs-home__link",onClick:g=>m(c).push(`/docs/${d.slug}`)},[s("span",fe,f(d.label),1),d.description?(r(),a("span",ye,f(d.description),1)):S("",!0)],8,ge))),128))]))),128))]),s("button",{class:"docs-home__start",onClick:t}," Start reading → ")]))])]))}}),Pe=N(Se,[["__scopeId","data-v-f6df323f"]]);export{Pe as default};
