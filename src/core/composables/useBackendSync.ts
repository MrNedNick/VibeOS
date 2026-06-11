import { useCloudSync } from './useCloudSync'

// Per-store helper that debounces Supabase pushes after local mutations.
// Usage: const sync = useBackendSync('platform:habits:habits')
//        watch(allHabits, v => sync.push(v), { deep: true })
export function useBackendSync(storageKey: string) {
  const { pushKey } = useCloudSync()
  let _timer: ReturnType<typeof setTimeout> | null = null
  let _lastSent: string | null = null

  function push(data: unknown): void {
    // Stores re-read localStorage after every pull (syncBus), which retriggers
    // their deep watchers with identical content. Pushing that back would
    // produce a realtime event → another pull → another push: an infinite
    // client↔server echo loop (S28 T2). Identical payloads never go out.
    const serialized = JSON.stringify(data)
    if (serialized === _lastSent) return

    if (_timer) clearTimeout(_timer)
    _timer = setTimeout(() => {
      _lastSent = serialized
      pushKey(storageKey, data).catch(err =>
        console.warn('[backendSync] push failed:', err)
      )
    }, 800)
  }

  return { push }
}
