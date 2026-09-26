import { ref, readonly } from 'vue'

// Module-level singleton — increments every time pullAll completes.
// Stores watch this to re-read fresh data from localStorage.
const _seq = ref(0)

// Flips to true once the first cloud pull has finished — merged, unchanged or
// failed — or once it is clear no pull is coming (no session, backend
// unreachable). Module screens stop showing skeletons at that point instead of
// waiting for a pullSeq bump that a no-op or failed pull never sends.
const _settled = ref(false)

export function useSyncBus() {
  function notifyPulled() { _seq.value++ }
  function markSettled() { _settled.value = true }
  return { pullSeq: readonly(_seq), notifyPulled, settled: readonly(_settled), markSettled }
}
