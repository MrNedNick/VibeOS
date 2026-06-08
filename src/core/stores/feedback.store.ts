import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { useAnalyticsSync } from '@/core/composables/useAnalyticsSync'

export interface FeedbackEntry {
  id: string
  score: number
  comment?: string
  timestamp: string
  sessionId: string
  appVersion: string
}

interface FeedbackState {
  entries: FeedbackEntry[]
  dismissCount: number
  lastDismissedAt: string
  lastSubmittedAt: string
  activeDays: string[]
}

export const useFeedbackStore = defineStore('platform:feedback', () => {
  const state = useStorage<FeedbackState>('platform:feedback', {
    entries: [],
    dismissCount: 0,
    lastDismissedAt: '',
    lastSubmittedAt: '',
    activeDays: [],
  })

  const entries       = computed(() => state.value.entries)
  const dismissCount  = computed(() => state.value.dismissCount)
  const lastSubmitted = computed(() => state.value.lastSubmittedAt)
  const activeDays    = computed(() => state.value.activeDays)

  function addEntry(entry: FeedbackEntry): void {
    state.value = {
      ...state.value,
      entries: [...state.value.entries, entry],
      lastSubmittedAt: entry.timestamp,
    }
    useAnalyticsSync().pushFeedbackEntry(entry).catch(console.warn)
  }

  function incrementDismiss(): void {
    state.value = {
      ...state.value,
      dismissCount: state.value.dismissCount + 1,
      lastDismissedAt: new Date().toISOString(),
    }
  }

  function recordActiveDay(dateStr: string): void {
    if (state.value.activeDays.includes(dateStr)) return
    state.value = {
      ...state.value,
      activeDays: [...state.value.activeDays, dateStr],
    }
  }

  return {
    entries,
    dismissCount,
    lastSubmitted,
    activeDays,
    addEntry,
    incrementDismiss,
    recordActiveDay,
  }
})
