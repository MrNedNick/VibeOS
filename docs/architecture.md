# Architecture

> Updated 2026-06-11. Reflects v2.7.16.

## Overview

VibeOS is a Vue 3 single-page application built as a modular platform. Each life module is a self-contained feature area sharing common infrastructure (`core/`, `ui/`). All state is localStorage-first via `useStorage()`. **Supabase backend is LIVE** (since 2026-06-04): auth, per-key JSONB sync (`user_store`), realtime, analytics/feedback sync.

---

## Folder Structure

```
src/
├── assets/styles/       # Global CSS tokens, reset, all 6 vibe-pak overrides
├── core/                # Platform-level shared infrastructure
│   ├── components/      # AchievementToast.vue — global overlay components
│   ├── composables/     # useStorage, useAsync, useConfirm, useAI, useCloudSync, useFeatureGate, useModuleVisibility
│   ├── events/          # PlatformEvent union type + useEventBus store
│   ├── i18n/            # EN + RU locales, useLocale composable, pluralRu helper
│   ├── registry/        # PLATFORM_MODULES — navigation manifest + module registry
│   ├── services/        # supabase.ts (lazy client), supabase.types.ts, ai.ts
│   ├── stores/          # ui.store (theme/sidebar), commandPalette.store, achievements.store
│   ├── types/           # Shared TypeScript types
│   └── utils/           # id.ts (generateId), storage.ts (storageKey, storagGet/Set)
├── layouts/             # AppLayout, AppSidebar, AppHeader, AppErrorBoundary, CommandPalette, AppBottomTabs
├── modules/             # 15+ feature modules (one folder per module)
│   └── [module-name]/
│       ├── index.ts     # Route definitions + module constants
│       ├── types/       # Module-specific TypeScript interfaces + helpers
│       ├── stores/      # Pinia store(s) using useStorage for persistence
│       ├── composables/ # Business logic (optional — for complex modules)
│       ├── components/  # Presentational sub-components
│       └── views/       # Route-level components (one per route)
├── router/              # Vue Router — lazy-loaded routes per module
└── ui/                  # Shared reusable UI components (Ui* prefix)
```

---

## Key Layers

### `core/` — Platform Infrastructure

Available to all modules. Never imports from `modules/`.

| Composable / Store | Purpose |
|-------------------|---------|
| `useStorage(key, default)` | Reactive ref that auto-persists to localStorage |
| `useAsync(fn)` | Wraps async calls with loading/error/data state |
| `useConfirm()` | Promise-based confirm dialog (UiConfirmDialog.vue) |
| `useAI()` / `aiComplete(prompt)` | Pollinations.ai wrapper — all 8 AI features use this |
| `useCloudSync()` | pullAll/pushAll/pushKey via `user_store`; merge engine + offline queue |
| `useBackendSync(key)` | Debounced (800ms) per-store push; skips payloads identical to last sent |
| `useSyncBus()` | `pullSeq` counter — stores re-read localStorage after a pull merges data |
| `useRealtimeSync()` | Supabase Realtime on `user_store`; ignores no-op echo events |
| `useFeatureGate()` | Free/demo/pro tier logic |
| `useModuleVisibility()` | Per-module show/hide in sidebar |
| `useEventBus` (store) | Typed PlatformEvent ring buffer (last 100 events) |
| `ui.store` | Theme (6 vibe-paks), sidebar open state, persisted |
| `commandPalette.store` | ⌘K open/close state |
| `achievements.store` | 10 predefined achievements, event-driven unlock |

### `modules/[name]/` — Feature Modules

Each module is self-contained. Dependencies allowed: `@/core/*` and `@/ui/*` only.

**Shipped modules:** Dashboard, Tasks, Board, Notes, Goals, Habits, Learning, Training, Finance, Analytics, Calendar, Games, Studio, Settings, About, Docs.

### `ui/` — Shared UI Components

Presentational-only, no business logic, no store access.

**Current components (22):** UiButton, UiCard, UiBadge, UiInput, UiField, UiSectionLabel, UiStat, UiProgressBar, UiProgressRing, UiFilterChips, UiEmptyState, UiSkeleton, UiConfirmDialog, UiPlannedView, UiIcon, UiModal, UiIconButton, UiSelect, UiTextarea, UiToastContainer, UiFab, UiFeedbackModal.

### `layouts/` — Application Shell

`AppLayout.vue` composes the full shell:
- `AppSidebar` — collapsible desktop sidebar; becomes bottom tab bar on mobile
- `AppHeader` — hamburger (mobile) + ⌘K trigger + theme toggle
- `AppErrorBoundary` — wraps router-view; catches runtime errors gracefully
- `CommandPalette` — ⌘K overlay with Actions/Habits/Navigation/Theme/AI groups
- `AppBottomTabs` — mobile navigation (auto-hides on desktop ≥768px)
- `AchievementToast` — global achievement unlock notification

---

## Data Flow

```
View → composable (useTasks) → Pinia store → useStorage → localStorage
                              ↑
         useEventBus (cross-module events) — habits ↔ goals ↔ learning ↔ training
         useAI (aiComplete) — 8 features all use one centralized composable
```

Views are thin. Business logic lives in composables or stores. State lives in stores.

---

## Cross-Module Communication

All cross-module communication goes through the **event bus** (`useEventBus` store):

```typescript
// Emit from a store action
events.emit({ type: 'habit:checked', habitId, habitName, timestamp })

// Receive via watcher on event bus history
watch(() => eventBus.history.length, () => checkAchievements())
```

**Typed events (PlatformEventType):**
`task:created | task:completed | task:deleted | habit:checked | habit:unchecked | note:created | note:deleted | card:created | card:moved | goal:created | goal:completed | goal:milestone:completed | learning:session:completed | learning:plan:created | learning:plan:completed | training:workout:logged | training:plan:created | game:score | studio:run`

**Direct cross-module links (via dynamic imports — no circular deps):**
- Habit check → auto-complete linked goal milestone (lazy import)
- Learning session logged → auto-check linked habit (lazy import)
- Training workout logged → auto-check linked habit (lazy import)

---

## AI Integration

All AI calls go through `src/core/composables/useAI.ts`:

```typescript
// Standalone helper (fire-and-forget)
const text = await aiComplete(prompt)

// Composable with reactive state
const { complete, loading, error } = useAI()
const text = await complete(prompt)
```

Provider: Pollinations.ai (free, no key, CORS-enabled). Studio module uses its own fetch for full conversation history.

---

## Storage Namespacing

All localStorage keys: `platform:[module]:[key]`

Examples:
```
platform:task-manager:tasks
platform:habits:habits
platform:goals:goals
platform:finance:expenses
platform:finance:budgets
platform:finance:baseCurrency
platform:games:snake:skin
platform:games:minesweeper:best
platform:achievements:unlocked
platform:ui:theme
platform:ui:sidebar
platform:events:history
```

---

## Routing Conventions

- All routes are children of the root `AppLayout` route
- Module views lazy-loaded via dynamic imports
- Route meta: `{ module: string, title: string, fullbleed?: boolean }`
- Full-bleed routes (Games, Studio) hide the standard content padding

---

## Adding a New Module

1. Create `src/modules/[name]/` with standard folder structure
2. Define types in `types/index.ts`
3. Create Pinia store using `storageKey('[name]', 'key')` for namespaced persistence
4. Implement composables if business logic is non-trivial
5. Build components using `@/ui` for shared primitives
6. Create view(s) that compose components
7. Export routes from `index.ts`, register in `src/router/index.ts`
8. Add entry to `src/core/registry/modules.ts` with `status: 'available'`
9. Add emoji description to `About` page `MODULE_DESCS` map
10. Document the module in `docs/modules/[name].md`

---

## Supabase Backend (LIVE since 2026-06-04)

Migrations 001 (per-entity tables + RLS, superseded for data by 002), 002 (`user_store` KV JSONB), 003 (`analytics_events` + `feedback_entries`) are applied. Credentials live in `.env.local` + GitHub Actions secrets. A keep-alive workflow pings REST every 3 days.

Files:
- `src/core/services/supabase.ts` — lazy client singleton, `isSupabaseConfigured`
- `src/core/stores/auth.store.ts` — login/register/logout/reset/avatar/email-change + demo mode
- `src/core/composables/useCloudSync.ts` — merge engine + offline queue (see invariants below)
- `supabase/migrations/*.sql` — schema + RLS

### Sync invariants (S28 — do not break these)

1. **Records carry `updatedAt`** (epoch ms; notes/board use ISO strings) stamped on every mutation. `effectiveTs()` = max(`updated_at`, `updatedAt`, `deletedAt`); the newer record wins the merge. Legacy unstamped records fall back to local-wins.
2. **Deletes are tombstones** (`deletedAt`), never array removal — a hard delete resurrects on the next merge because the remote copy survives. Budgets and board cards included. `gcTombstones()` clears tombstones older than 30 days.
3. **Budgets have no `id`** — merge keys on `id ?? category`.
4. **No echo loops:** `useBackendSync` never re-pushes an identical payload; `pullAll()` and the realtime handler skip no-op merges and only then notify the sync bus.
5. **Auth transitions isolate data:** `purgeDemoData()` strips `demo-` seeded records before any login/register/restore push or pull; `logout()` clears all `SYNC_KEYS` + queue (shared-browser privacy).
6. **Every `v-html` goes through `sanitizeHtml()`** (`@/core/utils`, DOMPurify) — markdown output is untrusted (AI responses, cloud-synced notes).
