# Module: Task Manager

**Route:** `/tasks`  
**Status:** ✅ Active  
**Migrated from:** `project 1/task-manager` (vanilla JS, single-component)

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

```
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
```

### Data Flow
```
TaskManagerView
  → useTasks() composable
      → useTasksStore (Pinia)
          → useStorage('platform:task-manager:tasks', [])
              → localStorage
      → useNotificationsStore (for toasts)
```

---

## Types

```typescript
type TaskFilter = 'all' | 'active' | 'done'

interface Task {
  id: string        // generateId() — timestamp-based
  text: string      // max 120 chars
  done: boolean     // completion status
  createdAt: number // Date.now()
}
```

---

## Storage

**Key:** `platform:task-manager:tasks`  
**Format:** JSON array of `Task[]`

---

## Migration Notes

Original was a vanilla JS monolith (`App.vue` with 400+ lines). Refactored to:
- Full TypeScript with strict types
- Pinia store with `useStorage` composable
- 5 focused components + 1 composable
- Namespaced localStorage key
- Integrated with platform notification system
- Theme managed by platform `ui.store`

---

## Planned Improvements

### Near-term (Next Sprint)
- **Product name + branding** — logo, color, typography identity
- **Localization** — see section below
- **Visual polish** — task text font treatment, hover states, micro-animations

### Medium-term
- Due dates with visual urgency indicators
- Priority levels (visual color coding)
- Keyboard-first navigation (j/k for navigation, space to toggle, d to delete)
- Task text inline editing (double-click to edit)
- Undo last delete (with timeout)

### Long-term / Ideas
- Recurring tasks (daily, weekly)
- Subtasks / nested structure
- Task categories / projects
- Export: CSV, JSON, plain text
- Statistics view: completion rate over time, average tasks per day
- Integration with Kanban module (move task to board)

---

## Localization Plans

> **Decision (2026-05-26):** Task Manager will support multiple languages via `vue-i18n`. This is a platform-wide requirement, but Task Manager will be the reference implementation for the i18n pattern.

### Requirements
- All UI strings must be externalized (no hardcoded English in templates)
- Default locale: English (`en`)
- First additional locale: to be decided (Russian is a strong candidate)
- Locale files: `src/modules/task-manager/locales/en.json`, `ru.json`, etc.
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
```typescript
// composables/useTasksI18n.ts
import { useI18n } from 'vue-i18n'

export function useTasksI18n() {
  const { t } = useI18n({ useScope: 'local' })
  return { t }
}
```

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
- Defined `useStorage` and `useAsync` core composables from Task Manager's needs
- Identified localization as a future platform-wide requirement
- User intent: treat Task Manager as a real product, not a demo — future branding, marketing positioning, potential standalone deployment
