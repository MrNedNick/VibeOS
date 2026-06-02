import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import type { InteractionEvent, InteractionEventType } from '@/core/events/interaction.types'

const MAX_BUFFER   = 10_000
const ROTATION_PCT = 0.2  // drop oldest 20% when buffer full

export const useInteractionBus = defineStore('platform:interaction-bus', () => {
  const history = useStorage<InteractionEvent[]>('platform:interaction-events', [])

  function emit(event: InteractionEvent): void {
    if (history.value.length >= MAX_BUFFER) {
      const dropCount = Math.floor(MAX_BUFFER * ROTATION_PCT)
      history.value = history.value.slice(dropCount)
    }
    history.value = [...history.value, event]
  }

  /** Last n events, optionally filtered by type. */
  function recent(n = 20, type?: InteractionEventType): InteractionEvent[] {
    const base = type ? history.value.filter(e => e.type === type) : history.value
    return base.slice(-n).reverse()
  }

  /** Event counts per module over the last `days` calendar days. */
  function countByModule(days = 30): Record<string, number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()
    const counts: Record<string, number> = {}
    for (const e of history.value) {
      if (e.timestamp < cutoffStr) continue
      if (e.type === 'module:visited' || e.type === 'module:time-spent' || e.type === 'feature:used') {
        const m = (e as { module: string }).module
        counts[m] = (counts[m] ?? 0) + 1
      }
    }
    return counts
  }

  /** Event counts per feature over the last `days` calendar days. */
  function countByFeature(days = 30): Record<string, number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()
    const counts: Record<string, number> = {}
    for (const e of history.value) {
      if (e.timestamp < cutoffStr) continue
      if (e.type === 'feature:used') {
        const key = `${e.module}:${e.feature}`
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
    return counts
  }

  /** Session summaries over the last `days` calendar days. */
  function sessionHistory(days = 30): Array<{ sessionId: string; start: string; duration?: number; modulesVisited?: string[] }> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()
    const starts = history.value.filter(e => e.type === 'session:start' && e.timestamp >= cutoffStr) as Array<{ type: 'session:start'; sessionId: string; timestamp: string }>
    return starts.map(s => {
      const end = history.value.find(e => e.type === 'session:end' && (e as { sessionId: string }).sessionId === s.sessionId) as { type: 'session:end'; duration: number; modulesVisited: string[] } | undefined
      return { sessionId: s.sessionId, start: s.timestamp, duration: end?.duration, modulesVisited: end?.modulesVisited }
    })
  }

  const totalCount = computed(() => history.value.length)

  function clear(): void {
    history.value = []
  }

  return { history, emit, recent, countByModule, countByFeature, sessionHistory, totalCount, clear }
})
