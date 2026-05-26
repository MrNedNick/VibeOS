# Module: Dashboard

**Route:** `/` (platform home)  
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
| Roadmap | Now / Next / Later items from `platform-notes.ts` |
| Tech Debt | Known issues with severity levels |

---

## Architecture

```
modules/dashboard/
├── index.ts                  → route definition (path: '')
├── data/
│   └── platform-notes.ts     → ROADMAP, TECH_DEBT, IDEAS, PLATFORM_STATUS
├── components/
│   ├── StatCard.vue           → numeric stat card
│   └── ModuleStatusCard.vue  → module card with live data slots
└── views/
    └── DashboardView.vue     → composes all sections
```

### Data Sources

- **Live data:** `useTasksStore` for task counts and progress
- **Static content:** `platform-notes.ts` for roadmap, tech debt, ideas
- **Registry:** `PLATFORM_MODULES` from `src/core/registry/modules.ts`
- **Docs count:** `TOTAL_DOC_PAGES` from docs registry

### Design Decision: Static data files for editorial content
Roadmap items, tech debt, and ideas live in `src/modules/dashboard/data/platform-notes.ts` rather than a backend or markdown file. This is intentional — the dashboard data is editorial content that changes when development decisions change. A TypeScript file gives us type safety and co-location with the component that uses it.

When a backend is added in the future, these can be migrated to an API call via `useAsync`.

---

## Planned Improvements

### High priority
- **Responsive layout** — stat cards go 2×2 on `md`, 1-column on `sm`; detail panel stacks below list on `sm`

### Medium priority
- **Currency widget** — live rates for 3–5 favorite pairs; uses Frankfurter API; self-contained `DashboardWidget.vue` inside Currency module
- **Sprint/focus tracker** — simple "today's focus" text area saved to localStorage
- **Interactive roadmap** — check off nextTasks items from the dashboard directly

### Low priority
- **Recent activity feed** — last N events across modules (requires cross-module event system)
- **Build stats** — bundle size, TS errors count (from CI/build output)
- **Drag-to-prioritize** — reorder roadmap items within the detail panel

## Shipped Improvements

| Date | Feature | Details |
|------|---------|---------|
| 2026-05-26 | Module quick-launch | `→` button appears on hover in the module list for `available` modules; `@click.stop` navigates via `useRouter` without selecting the detail panel |

---

## Session Notes

### 2026-05-26 — Initial implementation
- Created as the platform home page (route `/`)
- Dashboard is placed in `section: 'platform'` in the module registry
- Uses live data from Task Manager store — demonstrates cross-module data access
- `platform-notes.ts` established as the editorial data pattern for platform-level content
