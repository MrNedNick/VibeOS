import { ref, readonly } from 'vue'

// Module-level singleton — increments every time pullAll completes.
// Stores watch this to re-read fresh data from localStorage.
const _seq = ref(0)

export function useSyncBus() {
  function notifyPulled() { _seq.value++ }
  return { pullSeq: readonly(_seq), notifyPulled }
}
