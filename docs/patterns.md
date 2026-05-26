# Reusable Patterns

## Persistent Reactive State

Use `useStorage()` to create a ref that auto-syncs to localStorage:

```ts
// In a Pinia store
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'

const items = useStorage<Item[]>(storageKey('my-module', 'items'), [])
```

The key is namespaced automatically. `storageKey('my-module', 'items')` → `platform:my-module:items`.

---

## Async Operations

Use `useAsync()` for any async call (future API requests):

```ts
import { useAsync } from '@/core/composables/useAsync'

const { data, loading, error, execute } = useAsync(fetchTasks)

// In template:
// <div v-if="loading">…</div>
// <div v-else-if="error">{{ error }}</div>
// <div v-else>{{ data }}</div>
```

---

## Notifications

Never import `useNotificationsStore` in components. Use it in composables:

```ts
// In a composable
import { useNotificationsStore } from '@/core/stores/notifications.store'
const notify = useNotificationsStore()

notify.success('Task added')
notify.error('Something went wrong')
notify.warning('Limit reached')
notify.info('3 tasks cleared')
```

---

## Module Composable Pattern

The standard pattern for a module composable:

```ts
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
```

The view only calls `useMyFeature()` — it never calls the store or notify directly.

---

## View Structure

```vue
<script setup lang="ts">
// 1. Import composable(s)
const { inputText, submit, store } = useMyFeature()
</script>

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
```

---

## Animation Conventions

List items always use `TransitionGroup` with these class names:

```css
.item-enter-active { transition: all 200ms var(--ease-spring); }
.item-leave-active { transition: all 160ms var(--ease); position: absolute; width: 100%; }
.item-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.98); }
.item-leave-to     { opacity: 0; transform: translateX(10px); }
.item-move         { transition: transform 200ms var(--ease); }
```

Page transitions are handled by `AppLayout.vue`. No module needs to implement its own page transition.

---

## ID Generation

Always use `generateId()` from `@/core/utils/id`. Never use `Date.now()` directly as an ID:

```ts
import { generateId } from '@/core/utils/id'

const newItem = { id: generateId(), ... }
```

---

## Theme-Aware Styling

All colors must come from CSS custom properties. The theme is switched by toggling `data-theme="light"` on `<html>`:

```css
/* Works in both themes automatically */
color: var(--color-text);
background: var(--color-surface);
border: 1px solid var(--color-border);
```

Never hardcode `#hex` or `rgb()` values for semantic colors.
