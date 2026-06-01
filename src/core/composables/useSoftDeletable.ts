import { computed } from 'vue'
import { useStorage } from './useStorage'

/**
 * Wraps a persisted array with soft-delete tombstone semantics (S15 T1).
 *
 * Returns:
 *   all   — raw Ref<T[]> including tombstones; use for add/update/cascade ops
 *   items — computed<T[]> filtered to !deletedAt; use in UI and derived computeds
 *   softDelete(id) — sets deletedAt = Date.now() on the matching item (no-op if already deleted)
 *   restore(id)    — clears deletedAt on the matching item
 *
 * Each store keeps its own domain-specific add / update / cascade logic by
 * accessing `all` directly. The composable owns only the tombstone lifecycle.
 *
 * Why: the pattern was copy-pasted across 7 stores. Any change to the tombstone
 * contract would require identical edits in each.
 */
export function useSoftDeletable<T extends { id: string; deletedAt?: number }>(
  storageKey: string,
  defaultValue: T[] = [],
) {
  const all = useStorage<T[]>(storageKey, defaultValue)
  const items = computed<T[]>(() => all.value.filter(e => !e.deletedAt))

  function softDelete(id: string): void {
    const item = all.value.find(e => e.id === id)
    if (item && !item.deletedAt) item.deletedAt = Date.now()
  }

  function restore(id: string): void {
    const item = all.value.find(e => e.id === id)
    if (item) delete item.deletedAt
  }

  return { all, items, softDelete, restore }
}
