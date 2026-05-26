import { ref, watch, type Ref } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'

/**
 * Reactive ref backed by localStorage.
 * Key format: "platform:<module>:<name>" — pass the full key from storageKey().
 */
export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  const state = ref<T>(storagGet<T>(key, defaultValue)) as Ref<T>

  watch(state, (value) => storageSet(key, value), { deep: true })

  return state
}
