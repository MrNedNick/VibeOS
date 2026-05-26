import { ref, type Ref } from 'vue'

export interface AsyncResult<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

/**
 * Wraps an async function with loading / error state.
 * Keeps components free of try/catch boilerplate.
 */
export function useAsync<T>(fn: (...args: unknown[]) => Promise<T>): AsyncResult<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute(...args: unknown[]): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      data.value = await fn(...args)
      return data.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unexpected error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = null
    loading.value = false
    error.value = null
  }

  return { data, loading, error, execute, reset }
}
