# Conventions

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

## Comments

- No comments explaining what code does (code is self-documenting).
- Only comment non-obvious constraints or workarounds (the "why", never the "what").
