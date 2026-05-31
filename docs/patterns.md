# Reusable Patterns

> Updated 2026-05-31. Reflects v0.8.0.

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

## AI Integration Pattern

All AI calls use the centralized `useAI` composable:

```typescript
import { aiComplete } from '@/core/composables/useAI'

// Fire-and-forget (post-action analysis)
async function analyze(data: SomeData) {
  loadingRef.value = true
  const prompt = `...`
  aiComplete(prompt)
    .then(result => { resultRef.value = result })
    .catch(() => {})           // silent — AI is supplementary
    .finally(() => { loadingRef.value = false })
}

// Await with error handling (interactive AI)
async function generatePlan() {
  try {
    const text = await aiComplete(prompt)
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) { errorRef.value = 'Could not parse response'; return }
    const data = JSON.parse(match[0])
    // ... apply data to form
  } catch {
    errorRef.value = 'AI request failed — try again'
  } finally {
    loadingRef.value = false
  }
}
```

**JSON extraction from AI response:**
```typescript
const match = text.match(/\{[\s\S]*?\}/)  // finds first JSON object
if (!match) { /* handle error */ }
const data = JSON.parse(match[0])
```

---

## Game Skin Pattern

All games with skins follow the Snake pattern:

```typescript
interface Skin {
  id: string; name: string; emoji: string; unlock: number
  // Game-specific: color vars, emoji pools, CSS vars, etc.
}

const unlockedSkins = useStorage<string[]>('platform:games:[game]:unlocked', ['default'])
const activeSkinId  = useStorage<string>('platform:games:[game]:skin', 'default')

// On win/score:
for (const skin of SKINS) {
  if (skin.unlock > 0 && score >= skin.unlock && !unlockedSkins.value.includes(skin.id)) {
    unlockedSkins.value = [...unlockedSkins.value, skin.id]
    newUnlockRef.value = skin.name  // show banner
  }
}
```

---

## Drag-to-Reorder Pattern

```typescript
// State
const draggingId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

// Handlers
function onDragStart(e: DragEvent, id: string) {
  draggingId.value = id
  e.dataTransfer?.setData('text/plain', id)
}
function onDragEnd()  { draggingId.value = null; dragOverId.value = null }
function onDragOver(e: DragEvent, id: string) {
  e.preventDefault()
  if (draggingId.value && draggingId.value !== id) dragOverId.value = id
}
function onDrop(id: string) {
  if (draggingId.value) store.reorderItems(draggingId.value, id)
  draggingId.value = null; dragOverId.value = null
}

// Store method
function reorderItems(fromId: string, toId: string): void {
  const arr = [...items.value]
  const fromI = arr.findIndex(h => h.id === fromId)
  const toI   = arr.findIndex(h => h.id === toId)
  const [item] = arr.splice(fromI, 1)
  arr.splice(toI, 0, item)
  items.value = arr
}
```

---

## Confirm Dialog Pattern

```typescript
import { useConfirm } from '@/core/composables/useConfirm'
const { confirm } = useConfirm()

async function deleteItem(id: string) {
  const ok = await confirm({
    title:        'Delete this item?',
    body:         'This cannot be undone.',
    danger:       true,
    confirmLabel: 'Delete',
  })
  if (ok) store.deleteItem(id)
}
```

---

## ID Generation

Always use `crypto.randomUUID()` for new entity IDs (available natively in all modern browsers):

```typescript
const newItem = { id: crypto.randomUUID(), ... }
```

`generateId()` from `@/core/utils/id` is legacy — prefer `crypto.randomUUID()` for new code.

Never use `Date.now()` directly as an ID:

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
