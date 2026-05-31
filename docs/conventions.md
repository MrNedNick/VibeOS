# Conventions

> Updated 2026-05-31. Reflects v0.9.3.
> ⚠️ **Keep this file current.** If you add a new convention or @/ui component, update this doc in the same commit.


## Naming

| What | Convention | Example |
|------|-----------|---------|
| Vue components | PascalCase | `TaskItem.vue`, `UiButton.vue` |
| Shared UI components | `Ui` prefix | `UiButton`, `UiBadge`, `UiInput` |
| Pinia stores | camelCase + `.store.ts` | `tasks.store.ts`, `ui.store.ts` |
| Composables | `use` prefix | `useTasks.ts`, `useStorage.ts` |
| Types/Interfaces | PascalCase | `Task`, `TaskFilter`, `Notification` |
| Utils | camelCase | `generateId`, `storageKey` |
| Route names | `[module].[action]` | `task-manager.list` |
| Store IDs | `[module]:[name]` | `task-manager:tasks`, `core:ui` |
| Storage keys | `platform:[module]:[key]` | `platform:task-manager:tasks` |

## File Structure Rules

- **One component per file.** No multi-export `.vue` files.
- **Views = route targets only.** Views compose components; they don't contain UI logic.
- **Composables own business logic.** If a component has more than 2 computed values or methods, extract to a composable.
- **Stores own state.** Components never write to state directly — always through store actions.
- **No barrel files inside modules.** Import directly from the file.

## Component Rules

- Use `<script setup>` always — no Options API.
- Define props with `defineProps<Interface>()` — typed, no `PropType`.
- Use `defineModel()` for v-model bindings.
- Keep template logic minimal — extract to composable when logic grows.
- Use `Transition` / `TransitionGroup` for all show/hide and list animations.

## CSS Rules

- Scoped styles for components (`<style scoped>`).
- Use CSS custom properties from `main.css` — never hardcode colors or spacing.
- No inline styles except for dynamic values (e.g., `:style="{ width: \`${n}%\` }"`).
- Design token naming: `--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--t-*`.

## Store Rules

- Use Composition API style (`defineStore('id', () => { ... })`).
- Store ID format: `[module]:[name]`.
- Module stores use `useStorage()` for persistence.
- Never call notification store from within a module store — do it in composables.

## Import Aliases

Always use `@/` for absolute imports from `src/`:
```ts
import { useStorage } from '@/core/composables/useStorage'
import { UiButton } from '@/ui'
```

Never use relative paths that go up more than one level (`../../`).

## AI Composable Convention

Use `aiComplete(prompt)` from `@/core/composables/useAI` for all Pollinations.ai calls.
Never write `fetch('https://text.pollinations.ai/')` inline in components or stores.

```typescript
import { aiComplete } from '@/core/composables/useAI'
// ...
const result = await aiComplete(prompt)  // throws on failure
```

For reactive loading state, use `useAI()` composable instead.

## Skeleton Loading Convention

Every component that loads async data must ship with a skeleton state:
- Show skeleton while `loading === true`
- Skeleton matches the height/shape of real content (no layout shift)
- Use `UiSkeleton` from `@/ui`

## @/ui Component Usage (S8 Design System)

All shared UI patterns live in `src/ui/`. Import from `@/ui`:

```ts
import {
  UiSectionLabel, UiProgressBar, UiStat,
  UiFilterChips, UiCard, UiField,
  UiButton, UiBadge, UiInput, UiSkeleton,
  UiEmptyState, UiProgressRing, UiIcon,
} from '@/ui'
```

**Never define one-off versions of these patterns in module scoped styles.** If a pattern doesn't exist in `@/ui` yet, add it there first.

### Quick reference

| Component | Use for | Key props |
|-----------|---------|-----------|
| `UiSectionLabel` | Uppercase section headings | `size="sm\|md"`, `as="p\|h2…"` |
| `UiProgressBar` | Horizontal fill bars | `value` (0–100), `color`, `height`, `showLabel` |
| `UiStat` | Large number + label | `value`, `label`, `icon`, `color`, `mono`, `size`, `align` |
| `UiFilterChips` | Tab/chip filter rows | `options`, `v-model`, `variant="tabs\|pills"`, `size` |
| `UiCard` | Surface containers | `padding`, `hoverable`, `clickable`, `surface`, `as` |
| `UiField` | Form field with label | `label`, `hint`, `error`, `required`, `fieldId` |
| `UiSkeleton` | Loading placeholders | `width`, `height`, `rounded`, `inline` |
| `UiEmptyState` | Empty lists/views | `icon`, `title`, `subtitle`, `action-label` |
| `UiButton` | All buttons | `variant`, `size`, `loading`, `disabled` |
| `UiBadge` | Status tags | `color`, `size` |
| `UiProgressRing` | Circular progress | `value`, `size`, `label` |

## S9 Visual Conventions (enforced from v0.9.0)

These rules apply to all new and touched components:

- **No hardcoded colors.** Use CSS vars: `--color-warning` not `#f59e0b`, `--color-accent` not `#4f8ef7`.
- **Shadows via tokens.** Use `--shadow-1` (base elevation), `--shadow-2` (hover/focused), `--shadow-3` (panels), `--shadow-4` (modals). Never `box-shadow: 0 4px 14px rgba(0,0,0,0.6)` inline.
- **Hover states via `color-mix`.** `background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-elevated))` not a flat `--color-surface-elevated`.
- **`rgba()` → `color-mix()`.** `rgba(79,142,247,.12)` → `color-mix(in srgb, var(--color-accent) 12%, transparent)`.
- **Typography line-heights.** Use `--leading-2xs` → `--leading-3xl` tokens, not bare `line-height: 1.5`.
- **Surface levels.** Cards default to `surface-base` (no shadow), raised/interactive cards use `surface="raised"` or add `box-shadow: var(--shadow-1)` explicitly.
- **`UiCard` usage:** `surface="raised"` for goal/plan/habit cards (shadow-1 base). `clickable` implies `hoverable` → shadow-2 on hover.

## Comments

- No comments explaining what code does (code is self-documenting).
- Only comment non-obvious constraints or workarounds (the "why", never the "what").
