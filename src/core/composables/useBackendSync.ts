import { useCloudSync } from './useCloudSync'

// Per-store helper that debounces Supabase pushes after local mutations.
// Usage: const sync = useBackendSync('platform:habits:habits')
//        watch(allHabits, v => sync.push(v), { deep: true })
export function useBackendSync(storageKey: string) {
  const { pushKey } = useCloudSync()
  let _timer: ReturnType<typeof setTimeout> | null = null

  function push(data: unknown): void {
    if (_timer) clearTimeout(_timer)
    _timer = setTimeout(() => {
      pushKey(storageKey, data).catch(err =>
        console.warn('[backendSync] push failed:', err)
      )
    }, 800)
  }

  return { push }
}
