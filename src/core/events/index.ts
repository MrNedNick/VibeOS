import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import type { PlatformEvent, PlatformEventType } from './types'

export type { PlatformEvent, PlatformEventType }
export * from './types'

const MAX_HISTORY = 100

export const useEventBus = defineStore('platform:events', () => {
  // Persisted ring buffer of the last MAX_HISTORY events
  const history = useStorage<PlatformEvent[]>('platform:events:history', [])

  /** Emit a platform event — appends to history and notifies any listeners. */
  function emit(event: PlatformEvent): void {
    history.value = [event, ...history.value].slice(0, MAX_HISTORY)
  }

  /** Return the last `n` events, optionally filtered by type. */
  function recent(n = 10, type?: PlatformEventType): PlatformEvent[] {
    const base = type ? history.value.filter(e => e.type === type) : history.value
    return base.slice(0, n)
  }

  /** Clear all stored history. */
  function clear(): void {
    history.value = []
  }

  return { history, emit, recent, clear }
})
