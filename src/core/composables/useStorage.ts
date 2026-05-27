import { ref, watch, type Ref } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'

export interface StorageOptions<T> {
  /** Schema version. When it changes, `migrate` is called to transform old data. */
  version?: number
  /**
   * Migration function. Receives the raw stored value (typed as `unknown`) and
   * the version that was stored. Return the new value of type T.
   * Called once when the stored version differs from `options.version`.
   */
  migrate?: (oldValue: unknown, oldVersion: number) => T
}

const VERSION_SUFFIX = '__v'

/**
 * Reactive ref backed by localStorage.
 * Key format: "platform:<module>:<name>" — pass the full key from storageKey().
 *
 * Optional schema versioning:
 * ```ts
 * const tasks = useStorage('platform:tasks:list', [], {
 *   version: 2,
 *   migrate: (old, v) => v < 2 ? migrateTasks(old) : (old as Task[]),
 * })
 * ```
 */
export function useStorage<T>(key: string, defaultValue: T, options?: StorageOptions<T>): Ref<T> {
  let initialValue: T

  if (options?.version !== undefined) {
    const versionKey = key + VERSION_SUFFIX
    const storedVersion = storagGet<number>(versionKey, 0)
    const rawValue = storagGet<unknown>(key, undefined)

    if (rawValue === undefined || rawValue === null) {
      // Nothing stored yet — save default + version
      initialValue = defaultValue
      storageSet(versionKey, options.version)
    } else if (storedVersion !== options.version && options.migrate) {
      // Version mismatch — run migration
      initialValue = options.migrate(rawValue, storedVersion)
      storageSet(key, initialValue)
      storageSet(versionKey, options.version)
    } else {
      initialValue = rawValue as T
      // Stamp version if it was missing (first time adding versioning to an existing key)
      if (storedVersion !== options.version) {
        storageSet(versionKey, options.version)
      }
    }
  } else {
    initialValue = storagGet<T>(key, defaultValue)
  }

  const state = ref<T>(initialValue) as Ref<T>

  watch(state, (value) => storageSet(key, value), { deep: true })

  return state
}
