# Architecture

## Overview

**frontend-platform** is a Vue 3 platform application built as a single codebase containing multiple independent modules. Each module is a self-contained feature area (Task Manager, Kanban, Notes, etc.) sharing a common infrastructure.

---

## Folder Structure

```
src/
├── assets/styles/       # Global CSS tokens and reset
├── core/                # Platform-level shared infrastructure
│   ├── composables/     # useStorage, useAsync — shared across all modules
│   ├── registry/        # PLATFORM_MODULES — navigation manifest
│   ├── stores/          # ui.store (theme, sidebar), notifications.store
│   ├── types/           # Shared TypeScript types (ID, LoadingState…)
│   └── utils/           # id.ts, storage.ts — pure utilities
├── layouts/             # AppLayout + AppSidebar, AppHeader, AppNotifications
├── modules/             # Feature modules (one folder per module)
│   └── task-manager/
│       ├── index.ts     # Route definitions + module constants
│       ├── types/       # Module-specific TypeScript interfaces
│       ├── stores/      # Pinia store(s) for this module
│       ├── composables/ # Business logic composables
│       ├── components/  # Presentational components
│       └── views/       # Route-level components (one per route)
├── router/              # Vue Router configuration
└── ui/                  # Shared reusable UI components (Ui* prefix)
```

---

## Key Layers

### `core/` — Platform Infrastructure
Everything in `core/` is available to any module. It should never import from `modules/`.

- **`useStorage(key, default)`** — reactive localStorage ref, auto-persists via watcher
- **`useAsync(fn)`** — wraps async calls with `loading`, `error`, `data` state
- **`ui.store`** — theme (dark/light), sidebar open/collapsed; persisted to localStorage
- **`notifications.store`** — toast system; `success/error/warning/info` convenience methods
- **`PLATFORM_MODULES`** — central registry for sidebar navigation

### `modules/[name]/` — Feature Modules
Each module is isolated. Only dependencies allowed: `@/core/*` and `@/ui/*`.

Module `index.ts` exports:
- `MODULE_ID`, `MODULE_PATH`, `MODULE_LABEL` — used by registry
- `[name]Routes` — RouteRecordRaw[] imported by `router/index.ts`

### `ui/` — Shared UI Components
Presentational-only components with `Ui` prefix. No business logic, no store access.

Current components: `UiButton`, `UiBadge`, `UiInput`

### `layouts/` — Application Shell
`AppLayout.vue` composes the full shell: sidebar + header + `<router-view>` + notifications.
All modules render inside this layout via the router's `children` array.

---

## Data Flow

```
View → composable (useTasks) → Pinia store → useStorage → localStorage
                              ↑
         core store (notifications) — cross-cutting side effects
```

Views are thin. Business logic lives in composables. State lives in stores.

---

## Adding a New Module

1. Create `src/modules/[name]/` with the standard folder structure
2. Define types in `types/index.ts`
3. Create Pinia store using `storageKey('[name]', 'key')` for namespaced persistence
4. Implement composables that wrap store + notifications
5. Build components; use `@/ui` for shared primitives
6. Create a view that composes components via the composable
7. Export routes from `index.ts` and register in `src/router/index.ts`
8. Set `available: true` in `src/core/registry/modules.ts`

---

## Storage Namespacing

All localStorage keys follow the pattern: `platform:[module]:[key]`

Examples:
- `platform:task-manager:tasks`
- `platform:ui:theme`
- `platform:ui:sidebar`

---

## Routing Conventions

- Route names: `[module-id].[action]` — e.g. `task-manager.list`, `task-manager.detail`
- All routes are children of the root `AppLayout` route
- Route meta carries `module` (id) and `title`
- Module views are lazy-loaded via dynamic imports
